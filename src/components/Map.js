// src/components/Map.js
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { FaLocationArrow } from 'react-icons/fa';
import './Map.css'; // New CSS file for this component

// Fix for default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const RoutingMachine = ({ start, end, onRouteFound }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || !start || !end) return;

    // Remove previous route if it exists
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      lineOptions: { styles: [{ color: '#6FA1EC', weight: 4 }] },
      show: false,
      addWaypoints: false,
      routeWhileDragging: true,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
    }).addTo(map);

    routingControl.on('routesfound', function (e) {
      const routes = e.routes;
      const summary = routes[0].summary;
      // Pass route info up to the parent component
      onRouteFound({
        distance: (summary.totalDistance / 1000).toFixed(2), // distance in km
        time: Math.round(summary.totalTime / 60), // time in minutes
      });
    });

    routingControlRef.current = routingControl;

    return () => {
      if (map && routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, start, end, onRouteFound]);

  return null;
};


const Map = ({ theme }) => {
  const [map, setMap] = useState(null);
  const [pointA, setPointA] = useState(null);
  const [pointB, setPointB] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  const handleMapClick = (e) => {
    if (!pointA) {
      setPointA([e.latlng.lat, e.latlng.lng]);
      setRouteInfo(null); // Clear old route info
    } else if (!pointB) {
      setPointB([e.latlng.lat, e.latlng.lng]);
    }
  };
  
  const MapClickHandler = () => {
    useMap().on('click', handleMapClick);
    return null;
  }

  const handleReset = () => {
    setPointA(null);
    setPointB(null);
    setRouteInfo(null);
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation = [latitude, longitude];
          setPointA(userLocation);
          setRouteInfo(null);
          if (map) {
            map.flyTo(userLocation, 13); // Pan map to user's location
          }
        },
        () => {
          alert("Could not get your location. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };
  
  // URLs for different map themes
  const tileLayers = {
    light: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
  }
  const attribution = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'


  return (
    <div className="map-wrapper">
      <div className="info-panel">
        <h3>Instructions & Info</h3>
        {!pointA && <p>Click the map or use your location to set Point A.</p>}
        {pointA && !pointB && <p>Point A is set. Click map for Point B.</p>}
        
        <button className="location-button" onClick={handleUseMyLocation}>
          <FaLocationArrow /> Use My Location for A
        </button>
        <button className="reset-button" onClick={handleReset}>Reset Points</button>

        {routeInfo && (
          <div className="route-summary">
            <h4>Route Summary</h4>
            <p><strong>Distance:</strong> {routeInfo.distance} km</p>
            <p><strong>Estimated Time:</strong> {routeInfo.time} minutes</p>
          </div>
        )}
      </div>

      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        whenCreated={setMap} // Get map instance
      >
        <TileLayer url={tileLayers[theme]} attribution={attribution} />
        <MapClickHandler />

        {pointA && <Marker position={pointA}><Popup>Point A</Popup></Marker>}
        {pointB && <Marker position={pointB}><Popup>Point B</Popup></Marker>}
        
        {pointA && pointB && <RoutingMachine start={pointA} end={pointB} onRouteFound={setRouteInfo} />}
      </MapContainer>
    </div>
  );
};

export default Map;