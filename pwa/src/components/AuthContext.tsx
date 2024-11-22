import React, { createContext, useEffect, useState } from 'react';
import { decode } from 'jwt-js-decode';

// Creamos el contexto
interface AuthContextType {
    userRole: string | null;
    loading: boolean;
    login: (token: string) => void;
}

export const AuthContext = createContext<AuthContextType>({ userRole: null, loading: true, login: () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Estado de carga
    

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = decode(token);
                setUserRole(decoded.payload.role);
            } catch (error) {
                // Manejar el error de decodificación
                console.error('Error decoding token:', error);
                // Aquí podrías limpiar el token si es inválido
                localStorage.removeItem('token');
            }
        }
        setLoading(false); // Finaliza la carga una vez que se intenta decodificar el token
    }, []);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        const decoded = decode(token);
        setUserRole(decoded.payload.role);
    };

    return (
        <AuthContext.Provider value={{ userRole, loading, login }}>
            {children}
        </AuthContext.Provider>
    );
};
