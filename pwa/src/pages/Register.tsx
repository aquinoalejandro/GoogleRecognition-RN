import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import '../styles/_register.scss';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import Swal from 'sweetalert2';
import planta from '../../public/images/planta.png'

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cuil, setCuil] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Las contraseñas no coinciden',
        showConfirmButton: true,
        timer: 2000,
      });
      return;
    }

    try {

      const response = await axios.post('http://localhost:3000/auth/register', {
        username,
        email,
        password,
        nombre,
        apellido,
        cuil,
      });

      if (response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          showConfirmButton: true,
          timer: 1500,
        });
        localStorage.setItem('token', response.data.token);
        navigate('/admin/establecimientos');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Algo salió mal durante el registro',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Error en el registro. Inténtalo de nuevo.',
      });
      console.error('Error en el registro:', error);
    }
  };
  console.log(nombre)
  return (
    <div className="register-container">
      <div className='planta-container'>
        <img src={planta} alt="" className='planta'/>
      </div>

      <div className="box-content">
        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleRegister} // Manejo del evento submit
        >
          <h1>Regístrate</h1>
          {/* Nombre y Apellido en una sola fila */}
          <div className="form-row">
            <TextField
              required
              id="outlined-nombre"
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)} // Captura del valor de nombre
            />
            <TextField
              required
              id="outlined-apellido"
              label="Apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)} // Captura del valor de apellido
            />
          </div>
          {/* CUIL */}
          <TextField
            required
            id="outlined-cuil"
            label="CUIL"
            value={cuil}
            onChange={(e) => setCuil(e.target.value)} // Captura del valor de CUIL
          />
          {/* Username */}
          <TextField
            required
            id="outlined-username"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Captura del valor de username
          />
          {/* Correo */}
          <TextField
            required
            id="outlined-email"
            label="Correo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Captura del valor de correo
          />
          {/* Contraseña y Confirmar Contraseña en una sola fila */}
          <div className="form-row">
            <TextField
              required
              id="outlined-password"
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Captura del valor de contraseña
              autoComplete="new-password"
            />
            <TextField
              required
              id="outlined-confirm-password"
              label="Confirmar contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} // Captura del valor de confirmación de contraseña
              autoComplete="new-password"
            />
          </div>
          {/* Botón de registro */}
          <button type="submit" className="main-button">Registrarse</button>
          <Link to="/login">¿Ya tienes una cuenta? Inicia sesión aquí.</Link>
        </Box>
      </div>

    </div>
  );
};

export default Register;
