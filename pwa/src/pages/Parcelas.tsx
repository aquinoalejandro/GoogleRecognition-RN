import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import AdminSidebar from "../components/AdminSidebar";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import * as turf from "@turf/turf";
import Bar from '../components/Bar';
import { Modal, Button, Form } from 'react-bootstrap';

// Import Leaflet.draw
import 'leaflet-draw';

// Extend Leaflet to include DrawToolbar
declare module 'leaflet' {
  namespace Control {
    class Draw extends L.Control {
      constructor(options?: DrawConstructorOptions);
    }
  }
}

interface Parcela {
  id: string;
  nombre: string;
  poligono: [number, number][];
}

interface Establecimiento {
  id: string;
  nombre: string;
  poligono: [number, number][];
}

const Parcelas: React.FC = () => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [modalMap, setModalMap] = useState<L.Map | null>(null);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [establecimiento, setEstablecimiento] = useState<Establecimiento | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newParcelaName, setNewParcelaName] = useState("");
  const [drawnItems, setDrawnItems] = useState<L.FeatureGroup | null>(null);
  const modalMapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const establecimientoId = localStorage.getItem("establecimientoId");
    if (!establecimientoId) {
      console.error("Establecimiento ID no encontrado en localStorage.");
      return;
    }
  
    const fetchEstablecimiento = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/api/establecimiento/${establecimientoId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Error al obtener el establecimiento");
        }
        const data = await response.json();
        console.log("Datos del establecimiento:", data);
  
        if (typeof data.poligono === 'string') {
          data.poligono = JSON.parse(data.poligono);
        }
  
        setEstablecimiento(data);
        fetchParcelas(establecimientoId);
      } catch (error) {
        console.error("Error al obtener el establecimiento:", error);
      }
    };
  
    fetchEstablecimiento();
  }, []);

  const fetchParcelas = async (establecimientoId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/api/parcelas/${establecimientoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener las parcelas");
      }
      const data = await response.json();
      setParcelas(data);
    } catch (error) {
      console.error("Error al obtener las parcelas:", error);
    }
  };

  const addParcelasToMap = (mapInstance: L.Map) => {
    parcelas.forEach(parcela => {
      if (Array.isArray(parcela.poligono) && parcela.poligono.length > 0) {
        L.polygon(parcela.poligono, { color: "red" })
          .addTo(mapInstance)
          .bindPopup(parcela.nombre);
      } else {
        console.error(`Polígono inválido para la parcela ${parcela.id}:`, parcela.poligono);
      }
    });    
  };
  
  useEffect(() => {
    if (establecimiento && establecimiento.poligono && establecimiento.poligono.length > 0) {
      if (map) {
        map.remove();
      }
      const newMap = L.map("parcelas-map").setView(establecimiento.poligono[0], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(newMap);
  
      const establecimientoLayer = L.polygon(establecimiento.poligono, { color: "blue" }).addTo(newMap);
      newMap.fitBounds(establecimientoLayer.getBounds());
  
      setMap(newMap);

      // Add existing parcelas to the map
      addParcelasToMap(newMap);
    }      
  }, [establecimiento, parcelas]);

  const handleShowModal = () => {
    setShowModal(true);
    setTimeout(() => {
      if (modalMapRef.current && !modalMap && establecimiento) {
        const newModalMap = L.map(modalMapRef.current).setView(establecimiento.poligono[0], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(newModalMap);
  
        const establecimientoLayer = L.polygon(establecimiento.poligono, { color: "blue" }).addTo(newModalMap);
        newModalMap.fitBounds(establecimientoLayer.getBounds());
  
        // Add existing parcelas to the modal map
        addParcelasToMap(newModalMap);

        const items = new L.FeatureGroup();
        newModalMap.addLayer(items);
  
        const drawControl = new L.Control.Draw({
          draw: {
            polygon: {
              allowIntersection: false,
              showArea: true,
              drawError: {
                color: '#e1e100',
                message: '<strong>Oh snap!</strong> you can\'t draw that!',
              },
              shapeOptions: {
                color: '#97009c',
              },
            },
            polyline: false,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false,
          },
          edit: {
            featureGroup: items,
            remove: true,
          },
        });
  
        newModalMap.addControl(drawControl);
        setModalMap(newModalMap);
        setDrawnItems(items);
  
        newModalMap.on(L.Draw.Event.CREATED, (e: any) => {
          const layer = e.layer;
          items.clearLayers();
          items.addLayer(layer);
        });
      }
    }, 100);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewParcelaName("");
    if (modalMap) {
      modalMap.remove();
      setModalMap(null);
    }
    if (drawnItems) {
      drawnItems.clearLayers();
    }
  };

  const handleParcelaCreation = async () => {
    if (!newParcelaName || !drawnItems || drawnItems.getLayers().length === 0) {
      alert("Por favor, ingrese un nombre y dibuje la parcela en el mapa.");
      return;
    }

    const layer = drawnItems.getLayers()[0] as L.Polygon;
    let drawnCoords = (layer.getLatLngs()[0] as L.LatLng[]).map((latlng: L.LatLng): [number, number] => [latlng.lat, latlng.lng]);
    
    // Ensure the polygon is closed
    if (JSON.stringify(drawnCoords[0]) !== JSON.stringify(drawnCoords[drawnCoords.length - 1])) {
      drawnCoords.push(drawnCoords[0]);
    }

    // Verificar si la nueva parcela se superpone con las existentes
    const newParcelaPolygon = turf.polygon([drawnCoords]);
    const establecimientoPolygon = turf.polygon([establecimiento!.poligono]);

    if (!turf.booleanWithin(newParcelaPolygon, establecimientoPolygon)) {
      alert("La nueva parcela debe estar completamente dentro del establecimiento.");
      return;
    }

    for (const parcela of parcelas) {
      const parcelaPolygon = turf.polygon([parcela.poligono]);
      if (turf.booleanOverlap(newParcelaPolygon, parcelaPolygon)) {
        alert("La nueva parcela no puede superponerse con las parcelas existentes.");
        return;
      }
    }

    const token = localStorage.getItem("token");
    const establecimientoId = localStorage.getItem("establecimientoId");

    if (establecimientoId) {
      try {
        const response = await fetch("http://localhost:3000/api/parcela", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre: newParcelaName,
            poligono: drawnCoords,
            establecimientoId,
          }),
        });

        if (response.ok) {
          const newParcela = await response.json();
          setParcelas([...parcelas, newParcela]);
          
          // Add the new parcela to the main map
          if (map) {
            L.polygon(drawnCoords, { color: "red" })
              .addTo(map)
              .bindPopup(newParcelaName);
          }

          handleCloseModal();
        } else {
          const errorData = await response.json();
          console.error("Error al crear la parcela:", errorData);
          alert(`Error al crear la parcela: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error al crear la parcela:", error);
        alert("Error al crear la parcela");
      }
    }
  };

  useEffect(() => {
    parcelas.forEach(parcela => {
      const mapElement = document.getElementById(`parcela-map-${parcela.id}`);
      if (mapElement && establecimiento && parcela.poligono && parcela.poligono.length > 0) {
        const parcelaMap = L.map(`parcela-map-${parcela.id}`);
        
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(parcelaMap);
        
        // Add the establecimiento boundary
        if (establecimiento.poligono && establecimiento.poligono.length > 0) {
          L.polygon(establecimiento.poligono, { color: "blue", fillOpacity: 0.1 }).addTo(parcelaMap);
        }
        
        // Add all parcelas to the small map
        parcelas.forEach(p => {
          if (p.poligono && p.poligono.length > 0) {
            const color = p.id === parcela.id ? "red" : "orange";
            L.polygon(p.poligono, { color: color, fillOpacity: 0.5 }).addTo(parcelaMap);
          }
        });
        
        const parcelaLayer = L.polygon(parcela.poligono);
        parcelaLayer.addTo(parcelaMap);
        
        try {
          const bounds = parcelaLayer.getBounds();
          if (bounds.isValid()) {
            parcelaMap.fitBounds(bounds);
          } else {
            console.error(`Bounds not valid for parcela ${parcela.id}`);
            // Set a default view if bounds are not valid
            parcelaMap.setView([0, 0], 1);
          }
        } catch (error) {
          console.error(`Error setting bounds for parcela ${parcela.id}:`, error);
          // Set a default view if there's an error
          parcelaMap.setView([0, 0], 1);
        }
      }
    });
  }, [parcelas, establecimiento]);

  if (!establecimiento) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="admin-container">
      <AdminSidebar />  
      <div className="parcelas-container">  
        <Bar />
        <h1>Parcelas del Establecimiento</h1>
        <Button onClick={handleShowModal}>Crear Nueva Parcela</Button>
        <div id="parcelas-map" style={{ height: "400px", width: "80%", marginBottom: "20px" }}></div>
        <div className="parcelas-list">
          <h2>Parcelas:</h2>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {parcelas.map((parcela) => (
              <div key={parcela.id} style={{ margin: "10px", width: "200px" }}>
                <h3>{parcela.nombre}</h3>
                <div id={`parcela-map-${parcela.id}`} style={{ height: "150px", width: "100%" }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crear Nueva Parcela</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la Parcela</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el nombre de la parcela"
                value={newParcelaName}
                onChange={(e) => setNewParcelaName(e.target.value)}
              />
            </Form.Group>
          </Form>
          <div ref={modalMapRef} style={{ height: "400px", width: "100%" }}></div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleParcelaCreation}>
            Guardar Parcela
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Parcelas;