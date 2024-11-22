import { ReactElement, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { useState, useCallback } from "react";
import TableHOC from "../../components/TableHOC";
import { FaTrash } from "react-icons/fa";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Bar from '../../components/Bar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/_recursos.scss';

interface UserType {
  username: string;
  password: string; // Note: In a real application, do not store plaintext passwords!
  nombre: string;
  apellido: string;
  cuil: string;
  email: string;
  action: ReactElement;
}

const columns: { Header: string; accessor: keyof UserType }[] = [
  { Header: "Username", accessor: "username" },
  { Header: "Nombre", accessor: "nombre" },
  { Header: "Apellido", accessor: "apellido" },
  { Header: "CUIL", accessor: "cuil" },
  { Header: "Email", accessor: "email" },
  { Header: "Action", accessor: "action" },
];

const Toss = () => {
  const [data, setData] = useState<UserType[]>([]); // Estado para los datos de los empleados
  const [show, setShow] = useState(false);

  // State variables for form input
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [cuil, setCuil] = useState('');
  const [email, setEmail] = useState('');

  // Fetch empleados desde la API al montar el componente
  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/empleados");
        if (!response.ok) {
          throw new Error("Error al obtener los empleados");
        }

        const empleados = await response.json();

        // Mapeo de los empleados al formato UserType
        const mappedEmpleados = empleados.map((empleado: any) => ({
          username: empleado.username,
          password: "", // No se incluye en el mapeo
          nombre: empleado.nombre,
          apellido: empleado.apellido,
          cuil: empleado.cuil,
          email: empleado.email,
          action: (
            <button>
              <FaTrash />
            </button>
          ),
        }));

        setData(mappedEmpleados); // Actualiza el estado con los empleados mapeados
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchEmpleados(); // Llama a la función para obtener los empleados
  }, []);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newUser: UserType = {
      nombre,
      apellido,
      cuil,
      username,
      email,
      password,
      action: (
        <button>
          <FaTrash />
        </button>
      ),
    };

    try {
      // Hacer una solicitud POST a la API /registerEmpleado
      const response = await fetch("http://localhost:3000/auth/registerEmpleado", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error("Error al registrar usuario");
      }

      const result = await response.json();
      console.log("Usuario registrado:", result);

      // Añadir el nuevo usuario a la tabla si el POST fue exitoso
      setData([...data, newUser]);

      // Reset form fields
      setUsername('');
      setPassword('');
      setNombre('');
      setApellido('');
      setCuil('');
      setEmail('');

      handleClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const Table = useCallback(
    TableHOC<UserType>(
      columns,
      data,
      "dashboard-product-box",
      "Users",
      true
    ),
    [data] // Include data in dependency array to reflect updates
  );

  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="recursos-container">
        <Bar />

        <main>
          <Button variant="primary" onClick={handleShow}>
            Agregar Usuario
          </Button>
          {/* Modal for adding users */}
          <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
              <Modal.Title>Agregar Usuario</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group>
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>CUIL</Form.Label>
                  <Form.Control
                    type="text"
                    value={cuil}
                    onChange={(e) => setCuil(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit">
                  Agregar Usuario
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
          {Table()}
        </main>
      </div>
    </div>
  );
};

export default Toss;


