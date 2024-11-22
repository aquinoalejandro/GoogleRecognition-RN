import { Link } from "react-router-dom";
import '../styles/_main.scss';
import logo from '../../public/images/LOGOTEXTO.png'; 

const Main = () => {
  return (
    <div className="main-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="text-content">
        <h1>Agronomía Digital</h1>
        <p>Gestiona y monitorea tus cultivos.</p>
        <Link to="/login">
          <button className="main-button">Inicia sesión</button>
        </Link>
      </div>
    </div>
  );
};

export default Main;
