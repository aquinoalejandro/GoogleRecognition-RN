import { useEffect, useState, useContext } from "react";
import { IconType } from "react-icons";
import { Location } from 'react-router-dom';
import { AuthContext } from "./AuthContext";
import {
  FaWarehouse,
  FaBoxes,
  FaClipboardList,
  FaCalculator,
  FaUserTie,
  FaHome,
  FaMapMarkedAlt,
  FaTree,
} from "react-icons/fa";
import { HiMenuAlt4 } from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";
import userImg from "../../public/images/LOGOTEXTO.png";

const AdminSidebar = () => {
  const location = useLocation();
  const { userRole, loading } = useContext(AuthContext);  // Incluimos loading
  
  const [showModal, setShowModal] = useState<boolean>(false);
  const [phoneActive, setPhoneActive] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setPhoneActive(window.innerWidth < 1100);
    };
    handleResize(); // Call the function once to set the initial state
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    console.log('userRole updated:', userRole); // Log para ver cuando cambia el rol
  }, [userRole]);

  // Mientras loading sea true, mostramos un mensaje de carga
  if (loading) {
    return <div>Cargando...</div>; // O un spinner
  }

  return (
    <>
      {phoneActive && (
        <button id="hamburger" onClick={() => setShowModal(true)}>
          <HiMenuAlt4 />
        </button>
      )}

      <aside
        style={
          phoneActive
            ? {
                width: "20rem",
                height: "100vh",
                position: "fixed",
                top: 0,
                left: showModal ? "0" : "-20rem",
                transition: "all 0.5s",
              }
            : {}
        }
      >
        <img
          src={userImg}
          style={{
            cursor: "pointer",
            width: "10rem",
            height: "3.2rem",
          }}
        />
        <DivOne location={location} />
        <DivTwo location={location} />
        <DivThree location={location} userRole={userRole} />

        {phoneActive && (
          <button id="close-sidebar" onClick={() => setShowModal(false)}>
            Close
          </button>
        )}
      </aside>
    </>
  );
};

const DivOne = ({ location }: { location: Location }) => (
  <div>
    <h5>General</h5>
    <ul>
      <Li url="/admin/dashboard" text="General" Icon={FaHome} location={location} />
      <Li url="/admin/product" text="Mapa" Icon={FaMapMarkedAlt} location={location} />
      <Li url="/admin/parcelas" text="Parcelas" Icon={FaTree} location={location} />
    </ul>
  </div>
);

const DivTwo = ({ location }: { location: Location }) => (
  <div>
    <h5>Recursos</h5>
    <ul>
      <Li url="/admin/chart/bar" text="Materiales" Icon={FaBoxes} location={location} />
      <Li url="/admin/chart/pie" text="Stock" Icon={FaWarehouse} location={location} />
    </ul>
  </div>
);

const DivThree = ({
  location,
  userRole,
}: {
  location: Location;
  userRole: string | null;
}) => {
  return userRole === "admin" ? (
    <div>
      <h5>Administración</h5>
      <ul>
        <Li
          url="/admin/app/stopwatch"
          text="Trazabilidad"
          Icon={FaClipboardList}
          location={location}
        />
        <Li
          url="/admin/app/coupon"
          text="Contabilidad"
          Icon={FaCalculator}
          location={location}
        />
        <Li
          url="/admin/app/toss"
          text="Empleados"
          Icon={FaUserTie}
          location={location}
        />
      </ul>
    </div>
  ) : null;
};

interface LiProps {
  url: string;
  text: string;
  location: Location;
  Icon: IconType;
}

const Li = ({ url, text, location, Icon }: LiProps) => (
  <li
    style={{
      backgroundColor: location.pathname.includes(url)
        ? "rgba(0,115,255,0.1)"
        : "white",
    }}
  >
    <Link
      to={url}
      style={{
        color: location.pathname.includes(url) ? "rgb(0,115,255)" : "black",
      }}
    >
      <Icon />
      {text}
    </Link>
  </li>
);

export default AdminSidebar;
