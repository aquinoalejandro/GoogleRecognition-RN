import { useState } from 'react';
import AdminSidebar from "../../components/AdminSidebar";
import Bar from '../../components/Bar';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/_recursos.scss';

interface Resource {
  resourceType: string;
  category: string;
  seedType: string;
  duration: string;
  measure: string;
  stock: number;
  utilized: number; // Porcentaje de stock utilizado
  pricePerKg: number;
  totalPrice: number;
  available: number; // Stock disponible
}

const BarCharts = () => {
  const [show, setShow] = useState(false);
  const [resourceType, setResourceType] = useState('');
  const [category, setCategory] = useState('');
  const [seedType, setSeedType] = useState('');
  const [duration, setDuration] = useState('');
  const [measure, setMeasure] = useState('');
  const [stock, setStock] = useState(0);
  const [utilized, setUtilized] = useState(0); // Nueva variable de estado para el porcentaje utilizado
  const [pricePerKg, setPricePerKg] = useState(0);
  const [resources, setResources] = useState<Resource[]>([]);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const totalPrice = stock * pricePerKg;
    const available = stock - (stock * utilized) / 100;

    const newResource: Resource = {
      resourceType,
      category,
      seedType,
      duration,
      measure,
      stock,
      utilized,
      available,
      pricePerKg,
      totalPrice,
    };

    // Actualizar la lista de recursos
    setResources([...resources, newResource]);

    // Limpiar los campos del formulario
    setResourceType('');
    setCategory('');
    setSeedType('');
    setDuration('');
    setMeasure('');
    setStock(0);
    setUtilized(0);
    setPricePerKg(0);

    handleClose();
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="recursos-container">
        <Bar />
        <Button variant="primary" onClick={handleShow}>
          Agregar Recursos
        </Button>

        {/* Modal para agregar recursos */}
        <Modal show={show} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Agregar Recurso Agrícola</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Label>Tipo de Recurso</Form.Label>
                <Form.Control
                  as="select"
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                  required
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="semilla">Semilla</option>
                  <option value="fertilizante">Fertilizante</option>
                  <option value="agroquimico">Agroquímico</option>
                </Form.Control>
              </Form.Group>

              {resourceType === 'semilla' && (
                <>
                  <Form.Group>
                    <Form.Label>Categoría</Form.Label>
                    <Form.Control
                      as="select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      <option value="verdura">Verdura</option>
                      <option value="fruta">Fruta</option>
                    </Form.Control>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Tipo de Semilla</Form.Label>
                    <Form.Control
                      as="select"
                      value={seedType}
                      onChange={(e) => setSeedType(e.target.value)}
                      required
                    >
                      <option value="">Selecciona un tipo</option>
                      {category === 'verdura' && (
                        <>
                          <option value="cebolla">Cebolla</option>
                          <option value="morron">Morrón</option>
                          <option value="tomate">Tomate</option>
                        </>
                      )}
                      {category === 'fruta' && (
                        <>
                          <option value="banana">Banana</option>
                          <option value="manzana">Manzana</option>
                          <option value="frutilla">Frutilla</option>
                        </>
                      )}
                    </Form.Control>
                  </Form.Group>
                </>
              )}

              <Form.Group>
                <Form.Label>Duración del cultivo</Form.Label>
                <Form.Control
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Ej. 6 meses"
                  required
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Medida</Form.Label>
                <Form.Control
                  as="select"
                  value={measure}
                  onChange={(e) => setMeasure(e.target.value)}
                  required
                >
                  <option value="kg">Kilogramos</option>
                  <option value="g">Gramos</option>
                </Form.Control>
              </Form.Group>

              <Form.Group>
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value))}
                  required
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Porcentaje Utilizado</Form.Label>
                <Form.Control
                  type="number"
                  value={utilized}
                  onChange={(e) => setUtilized(parseFloat(e.target.value))}
                  placeholder="Ej. 50% de uso"
                  required
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Precio por Kilogramo</Form.Label>
                <Form.Control
                  type="number"
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(parseFloat(e.target.value))}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                Agregar Recurso
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Tabla para mostrar los recursos agregados */}
        <Table striped bordered hover className="mt-4 table-radius">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Utilizado (%)</th>
              <th>Disponible</th>
              <th>Precio Unitario</th>
              <th>Precio Total</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource, index) => (
              <tr key={index}>
                <td>{resource.seedType || resource.resourceType}</td>
                <td>{resource.category}</td>
                <td>{resource.stock}</td>
                <td>{resource.utilized}%</td>
                <td>{resource.available}</td>
                <td>${resource.pricePerKg}</td>
                <td>${resource.totalPrice}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default BarCharts;
