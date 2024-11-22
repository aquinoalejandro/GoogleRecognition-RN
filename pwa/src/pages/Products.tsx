import React, { useEffect, useState } from 'react';
import AdminSidebar from "../components/AdminSidebar";
import Bar from "../components/Bar";
import L, { Map } from 'leaflet';
import * as turf from '@turf/turf';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import '../styles/_recursos.scss';

let map: Map | undefined; // Declarar map como una variable global

interface Establecimiento {
  id: string;
  nombre: string;
  poligono: number[][]; // Coordenadas del polígono en formato [lng, lat]
}


const Products: React.FC = () => {

  const [establecimiento, setEstablecimiento] = useState<Establecimiento | null>(null);
  const [area, setArea] = useState<number | null>(null);

  
  useEffect(() => {
    // Inicializa el mapa solo una vez al cargar el componente
    if (!map) {
      console.log("Inicializando el mapa...");
      map = L.map('map', {
        center: [-27.2664, -58.6624], // Ubicación inicial predeterminada
        zoom: 15,
      });

      // Añadir capa de mosaico (OpenStreetMap)
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);
    }

    // Limpiar el mapa en caso de que se desmonte el componente
    return () => {
      if (map) {
        console.log("Eliminando el mapa...");
        map.remove();
        map = undefined; // Reiniciar la variable global para evitar fugas de memoria
      }
    };
  }, []); // Solo inicializar el mapa una vez cuando el componente se monta

  useEffect(() => {
    // Obtener los datos del establecimiento desde la API
    const fetchEstablecimiento = async () => {

      try {

        const token = localStorage.getItem("token");
        const id = localStorage.getItem("establecimientoId");
        const response = await fetch(`http://localhost:3000/api/establecimiento/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Incluir el token JWT en los headers
          },
        });

        if (!response.ok) {
          throw new Error(`Error al obtener el establecimiento: ${response.statusText}`);
        }
        const data = await response.json();

        console.log(data); // Log de la respuesta de la API

        // Verifica que los datos contengan las propiedades esperadas
        if (!data.nombre || !data.poligono) {
          throw new Error("Datos de establecimiento no válidos o incompletos");
        }

        // Convertir polígono de string a array
        const poligonoArray = JSON.parse(data.poligono);
        if (!Array.isArray(poligonoArray) || poligonoArray.length === 0) {
          throw new Error("El polígono no es un array válido");
        }

        setEstablecimiento({ ...data, poligono: poligonoArray }); // Guardar los datos del establecimiento con polígono convertido
      } catch (error) {
        console.error("Error al obtener el establecimiento:", error);
      }
    };

    fetchEstablecimiento(); // Llamar a la API cuando el componente se monta
  }, []); // Solo hacer fetch una vez al montar el componente

  useEffect(() => {
    // Solo dibujar el polígono si los datos del establecimiento están disponibles
    if (establecimiento && establecimiento.poligono.length > 0 && map) {
      try {
        // Asegúrate de que el polígono se cierre correctamente
        const coords : number[][] = establecimiento.poligono.map(coord => [coord[0], coord[1]]);

        // Si el primer y el último punto no son equivalentes, agrega el primer punto al final
        if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
          coords.push(coords[0]); // Cerrar el polígono
        }

        // Dibuja el polígono en el mapa
        const polygonLayer = L.polygon(coords, {
          color: '#4f92ff', // Color del polígono
        }).addTo(map);

        // Añadir popup con el nombre del establecimiento
        polygonLayer.bindPopup(establecimiento.nombre);

        // **Uso de Turf para calcular el área del polígono**
        const turfPolygon = turf.polygon([coords]); // Usamos `coords` aquí ya cerrado
        const areaValue = turf.area(turfPolygon); // Área en metros cuadrados
        setArea(areaValue); // Guardar el área calculada
        console.log("Área del establecimiento:", areaValue, "metros cuadrados");

        // **Centrar el mapa en el polígono cuando el mapa esté listo**
        map.whenReady(() => {
          map.fitBounds(polygonLayer.getBounds()); // Centra el mapa en el polígono
        });

      } catch (error) {
        console.error("Error al dibujar el polígono:", error);
      }
    }
  }, [establecimiento, map]); // Ejecutar este useEffect cada vez que se actualiza 'establecimiento'

  return (
    <div className="admin-container">
      <AdminSidebar />
      <div>
        <Bar />
        <p>Mapa de Parcelas</p>
        <p>
          {establecimiento && (
            <>
              <strong>{establecimiento.nombre}</strong>
              {area && <span> - Área: {area.toFixed(2)} m²</span>}
            </>
          )}
        </p>
        {/* Contenedor del mapa */}
        <div id="map" style={{ width: "1000px", height: "600px" }}></div>
      </div>
    </div>
  );
};

export default Products;
