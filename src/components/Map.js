// src/components/Map.js
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { FaLocationArrow } from 'react-icons/fa';
import './Map.css'; // Make sure you have this CSS file

// Fix for default marker icon (no change here)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// --- NEW ROBUST ROUTING COMPONENT ---
const RoutingMachine = ({ start, end, onRouteFound, onReset }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    // Create the routing control only once
    if (!routingControlRef.current) {
      const routingControl = L.Routing.control({
        waypoints: [], // Start with no waypoints
        lineOptions: { styles: [{ color: '#6FA1EC', weight: 4 }] },
        show: false,
        addWaypoints: false,
        routeWhileDragging: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
      }).on('routesfound', (e) => {
        const route = e.routes[0];
        if (onRouteFound) {
          onRouteFound({
            distance: (route.summary.totalDistance / 1000).toFixed(2),
            time: Math.round(route.summary.totalTime / 60),
          });
        }
      });
      // Add the control to the map and store the instance in useRef
      routingControlRef.current = routingControl.addTo(map);
    }

    // Update waypoints when start or end points change
    if (start && end) {
      routingControlRef.current.setWaypoints([
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1]),
      ]);
    } else {
      // Clear waypoints if points are reset
      routingControlRef.current.setWaypoints([]);
      if (onReset) {
        onReset(); // Also clear the info in the parent
      }
    }
  }, [map, start, end, onRouteFound, onReset]);

  return null;
};


const Map = ({ theme }) => {
  // whenCreated is deprecated, let's use a ref instead
  const mapRef = useRef(null);
  const [pointA, setPointA] = useState(null);
  const [pointB, setPointB] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  const handleMapClick = (e) => {
    if (!pointA) {
      setPointA([e.latlng.lat, e.latlng.lng]);
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
    // The RoutingMachine will see the null points and reset itself
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation = [latitude, longitude];
          setPointA(userLocation);
          const map = mapRef.current;
          if (map) {
            map.flyTo(userLocation, 13);
          }
        },
        () => {
          alert("Could not get your location. Please enable location services.");
        }
      );
    }
  };
  
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
        
        <button className="location-button" onClick={handleUseMyLocation} disabled={pointA}>
          <FaLocationArrow /> Use My Location for A
        </button>
        <button className="reset-button" onClick={handleReset} disabled={!pointA}>Reset Points</button>

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
        ref={mapRef} // Use ref to get the map instance
      >
        <TileLayer url={tileLayers[theme]} attribution={attribution} />
        <MapClickHandler />

        {/* Render the routing machine unconditionally */}
        <RoutingMachine 
          start={pointA} 
          end={pointB} 
          onRouteFound={setRouteInfo}
          onReset={() => setRouteInfo(null)}
        />

        {pointA && <Marker position={pointA}><Popup>Point A</Popup></Marker>}
        {pointB && <Marker position={pointB}><Popup>Point B</Popup></Marker>}
      </MapContainer>
    </div>
  );
};

export default Map;