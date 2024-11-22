import { useState, useContext } from 'react'; 
import { Link, useNavigate } from "react-router-dom";
import '../styles/_login.scss';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import { AuthContext } from '../components/AuthContext'; 
import loginImage from '../../public/images/imagendefinitiva.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        username,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        login(response.data.token); 
        navigate('/admin/establecimientos');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Credenciales incorrectas',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Error en el inicio de sesión. Verifica tus credenciales',
      });
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <div className="login-container">
     <div className='img-container'>
        <img src={loginImage} alt="notebook" className="login" />
      </div>
      <div className="box-content">
        <Box
          component="form"
          sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
          noValidate
          autoComplete="off"
          onSubmit={handleLogin}
        >
          <h1>Inicia sesión</h1>
          <div>
            <TextField
              id="outlined-username"
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              id="outlined-password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <Link to="" className='link-to'>¿Olvidaste tu contraseña?</Link>
          <button type="submit" className="main-button">Iniciar sesión</button>
          <Link to="/register" className='link-to'>¿Aún no te has registrado?, regístrate aquí.</Link>
        </Box>
      </div>
    </div>
  );
};

export default Login;
