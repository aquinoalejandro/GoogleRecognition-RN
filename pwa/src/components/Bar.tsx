import React from "react";
import { useNavigate } from "react-router-dom";
import userImg from "../assets/images/userpic.png";
import "../styles/_bar.scss";

const Bar: React.FC = () => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleBackClick = () => {
    navigate("/admin/establecimientos");
  };

  return (
    <div className="bar">
      <div className="bar-content">
        {/* Icono de flecha */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="icon-back"
          onClick={handleBackClick}
        >
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
        
        {/* Imagen del usuario */}
        <img
          src={userImg}
          alt="User"
          onClick={handleProfileClick}
          style={{ cursor: "pointer" }}
        />
      </div>
    </div>
  );
};

export default Bar;
