import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();

    useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        navigate('/login');
    }
}, [navigate]);

    return children;
};