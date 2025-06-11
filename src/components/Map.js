// src/components/Map.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Wrapper for the routing machine
const RoutingMachine = ({ start, end }) => {
  const map = useMapEvents({}); // This hook is a bit of a hack to get the map instance

  useEffect(() => {
    if (!map || !start || !end) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      routeWhileDragging: true,
      lineOptions: {
        styles: [{ color: '#6FA1EC', weight: 4 }]
      },
      show: false, // Hide the default instructions panel
      addWaypoints: false,
      draggableWaypoints: false,
    }).addTo(map);

    // Cleanup function to remove the routing control when component unmounts
    return () => map.removeControl(routingControl);
  }, [map, start, end]);

  return null;
};


const Map = () => {
  const [pointA, setPointA] = useState(null);
  const [pointB, setPointB] = useState(null);

  // Component to handle map clicks
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        if (!pointA) {
          setPointA([lat, lng]);
        } else if (!pointB) {
          setPointB([lat, lng]);
        }
      },
    });
    return null;
  };

  const handleReset = () => {
    setPointA(null);
    setPointB(null);
  }

  return (
    <div style={{ position: 'relative', height: '90vh' }}>
        <div style={{ marginBottom: '10px' }}>
            <h3>Map Instructions</h3>
            {!pointA && <p>Click on the map to set Point A.</p>}
            {pointA && !pointB && <p>Click on the map to set Point B.</p>}
            {pointA && pointB && <p>Route is drawn! <button onClick={handleReset}>Reset</button></p>}
        </div>

        <MapContainer
          center={[51.505, -0.09]} // Default center (London)
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler />
          {pointA && <Marker position={pointA}><Popup>Point A</Popup></Marker>}
          {pointB && <Marker position={pointB}><Popup>Point B</Popup></Marker>}
          {pointA && pointB && <RoutingMachine start={pointA} end={pointB} />}
        </MapContainer>
    </div>
  );
};

export default Map;
