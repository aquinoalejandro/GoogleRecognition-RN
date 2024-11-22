import React, { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { materialsData, salesHistoryData } from "../../assets/data2.json";
import "../../styles/_agnonomyStock.scss"; // Mantén tus estilos específicos
import "../../styles/_recursos.scss"; // Importa los estilos de recursos
import Bar from "../../components/Bar";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/_recursos.scss';

interface Material {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  sold: number;
  location: string;
}

interface Sale {
  id: number;
  product: string;
  quantity: number;
  status: string;
}

const AgronomyStock: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>(materialsData);
  const [salesHistory, setSalesHistory] = useState<Sale[]>(salesHistoryData);

  const handleSell = (material: Material) => {
    setSalesHistory((prevHistory) => [
      ...prevHistory,
      { id: material.id, product: material.name, quantity: material.quantity, status: "Vendido" },
    ]);
    setMaterials((prevMaterials) =>
      prevMaterials.filter((m) => m.id !== material.id)
    );
  };

  const handleCancelSale = (id: number) => {
    setSalesHistory((prevHistory) =>
      prevHistory.map((sale) =>
        sale.id === id ? { ...sale, status: "Cancelado" } : sale
      )
    );
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="recursos-container"> {/* Usa la misma clase que en recursos */}
        <Bar />
        <main className="stock-container">
          <section className="stock-section">
            <h2>Gestión de Stock</h2>
            <table className="stock-table table-radius"> {/* Usa clases para aplicar estilos similares */}
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Cantidad</th>
                  <th>Unidad</th>
                  <th>Vendidos</th>
                  <th>Almacén</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr key={material.id}>
                    <td>{material.name}</td>
                    <td>{material.category}</td>
                    <td>{material.quantity}</td>
                    <td>{material.unit}</td>
                    <td>{material.sold}</td>
                    <td>{material.location}</td>
                    <td>
                      <button onClick={() => handleSell(material)}>Vender</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="sales-section">
            <h2>Historial de Ventas</h2>
            <table className="sales-table table-radius">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {salesHistory.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.product}</td>
                    <td>{sale.quantity}</td>
                    <td>{sale.status}</td>
                    <td>
                      <button onClick={() => handleCancelSale(sale.id)}>
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AgronomyStock;
