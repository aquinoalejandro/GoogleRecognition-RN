import React, { useState, useEffect } from "react";
import L, { Map } from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/_leaftlet.scss";
import 'leaflet-draw'; 
import 'leaflet-draw/dist/leaflet.draw.css'; 
import Parcelas from "./Parcelas";


interface Establecimiento {
  id: string;
  nombre: string;
  provincia: string;
  ciudad: string;
  poligono: number[][]; 
}

const Establecimientos = () => {
  const [map, setMap] = useState<Map | null>(null);
  const [drawnPolygon, setDrawnPolygon] = useState<L.Polygon | null>(null);
  const [polygonCoords, setPolygonCoords] = useState<number[][]>([]);
  const [selectedEstablecimiento, setSelectedEstablecimiento] = useState<string | null>(null);
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [showParcelas, setShowParcelas] = useState(false);

  // Manejar la selección del establecimiento
  const handleEstablecimientoSelect = (id: string) => {
    setSelectedEstablecimiento(id);
    localStorage.setItem('establecimientoId', id); // Guardar ID en localStorage
  };

  // Inicialización del mapa con Leaflet
  useEffect(() => {
    const mapContainer = document.getElementById("map");

    // Verificar si ya existe un mapa en el contenedor
    if (mapContainer && mapContainer.children.length > 0) {
      return; // Si ya está inicializado, no hacemos nada
    }

    if (!map) {
      const newMap = L.map("map", {
        center: [-26.1836, -58.2414], 
        zoom: 15,
      });

      L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(newMap);

      const editableLayers = new L.FeatureGroup();
      newMap.addLayer(editableLayers);

      const drawControl = new L.Control.Draw({
        draw: {
          polygon: {}, 
          polyline: false,
          rectangle: {}, 
          circle: false,
          marker: false,
        },
        edit: {
          featureGroup: editableLayers,
          remove: true,
        },
      });

      newMap.addControl(drawControl);

      newMap.on(L.Draw.Event.CREATED, (e: any) => {
        const { layerType, layer } = e;

        if (layerType === "rectangle" || layerType === "polygon") {
          if (drawnPolygon) {
            newMap!.removeLayer(drawnPolygon);
          }
          setDrawnPolygon(layer);
          setPolygonCoords(layer.getLatLngs()[0].map((latlng: L.LatLng) => [latlng.lat, latlng.lng]));

          editableLayers.addLayer(layer);
        }
      });

      setMap(newMap);
    }

    return () => {
      // Limpiar el mapa si el componente se desmonta
      if (map) {
        map.remove();
      }
    };
  }, [map, drawnPolygon]);

  // Manejar la creación de nuevos establecimientos
  const handleEstablecimientoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nombre = (document.getElementById("nombre") as HTMLInputElement).value;
    const provincia = (document.getElementById("provincia") as HTMLInputElement).value;
    const ciudad = (document.getElementById("ciudad") as HTMLInputElement).value;
    const token = localStorage.getItem("token")

    const nuevoEstablecimiento: Establecimiento = {
        id: Date.now().toString(),
        nombre,
        provincia,
        ciudad,
        poligono: polygonCoords,
    };

    // Guardar el establecimiento en el backend
    try {
        const response = await fetch("http://localhost:3000/api/establecimiento", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Incluir el token JWT en los headers
            },
            body: JSON.stringify({
                ...nuevoEstablecimiento,
                poligono: polygonCoords // Incluir las coordenadas del polígono
            })
        });

        if (!response.ok) {
            throw new Error("Error al guardar el establecimiento");
        }

        // Agregar el nuevo establecimiento al estado
        const savedEstablecimiento = await response.json();
        setEstablecimientos([...establecimientos, savedEstablecimiento]);
        console.log("Establecimiento guardado:", savedEstablecimiento);
        localStorage.setItem("establecimientoId", savedEstablecimiento.id);
    } catch (error) {
        console.error("Error al crear establecimiento:", error);
    }
  };

  // Obtener los establecimientos existentes
  const fetchEstablecimientos = async () => {
    const token = localStorage.getItem('token'); // Asegúrate de que este sea tu token almacenado
    
    const response = await fetch("http://localhost:3000/api/establecimientos", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Asegúrate de incluir el token
        },
    });

    if (!response.ok) {
        throw new Error("Error al obtener establecimientos");
    }

    const data = await response.json();
    return data;
};


useEffect(() => {
  const loadEstablecimientos = async () => {
    try {
      const data = await fetchEstablecimientos();
      setEstablecimientos(data); // Actualiza el estado con los establecimientos obtenidos
      console.log(data); // Puedes ver lo que recibes aquí
    } catch (error) {
      console.error("Error al cargar los establecimientos:", error);
    }
  };

  loadEstablecimientos(); // Carga los establecimientos al montar el componente
}, []);


  // Función para manejar el clic en "Continuar"
  const handleContinue = () => {
    const establecimientoId = localStorage.getItem('establecimientoId');
    
    if (establecimientoId) {
      console.log("Redirigiendo al dashboard del establecimiento:", establecimientoId);
      window.location.href = "http://localhost:5173/admin/dashboard"; // Redirigir si hay un ID
    } else {
      alert("Debes seleccionar un establecimiento para continuar.");
    }
  };

  return (
    <div className="establecimiento-container">
      {!showParcelas ? (
        <>
      <h1>Tus establecimientos</h1>
      <p>Controla y monitorea tus establecimientos.</p>

      {/* Lista de establecimientos */}
      <div className="establecimientos-lista">
        {establecimientos.length > 0 ? (
          establecimientos.map((establecimiento) => (
            <div
              key={establecimiento.id}
              className={`establecimiento-item ${selectedEstablecimiento === establecimiento.id ? 'selected' : ''}`}
              onClick={() => handleEstablecimientoSelect(establecimiento.id)}
            >
              <h3>{establecimiento.nombre}</h3>
              <p>{establecimiento.provincia}, {establecimiento.ciudad}</p>
            </div>
          ))
        ) : (
          <p>No tienes establecimientos agregados.</p>
        )}
      </div>

      {/* Formulario para agregar nuevo establecimiento */}
      <div id="formulario-establecimiento" className="hidden">
        <h2>Nuevo Establecimiento</h2>
        <form onSubmit={handleEstablecimientoSubmit}>
          <div>
            <label htmlFor="nombre">Nombre del Establecimiento:</label>
            <input id="nombre" type="text" placeholder="Ingresa el nombre del establecimiento" required />
          </div>
          <div>
            <label htmlFor="provincia">Provincia:</label>
            <input id="provincia" type="text" placeholder="Ingresa la provincia" required />
          </div>
          <div>
            <label htmlFor="ciudad">Ciudad/Departamento:</label>
            <input id="ciudad" type="text" placeholder="Ingresa la ciudad o departamento" required />
          </div>

          {/* Mapa para marcar la parcela */}
          <div id="map" className="map"></div>

          <button type="submit">Guardar Establecimiento</button>
        </form>
      </div>

      <button className="main-button" onClick={handleContinue}>
        Continuar
      </button>

      <button
            className="main-button"
            onClick={() => document.getElementById("formulario-establecimiento")?.classList.toggle("hidden")}
          >
            Agregar Establecimiento
          </button>
        </>
      ) : (
        <Parcelas establecimientoId={selectedEstablecimiento!} onBack={() => setShowParcelas(false)} />
      )}
    </div>
  );
};

export default Establecimientos;
