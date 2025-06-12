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

// This is our "worker" component. It lives for the entire map session.
const Routing = ({ start, end, onRouteFound, onReset }) => {
  const map = useMap();
  const routingControlRef = useRef(null);
  // This ref will act as our "cancellation flag"
  const requestRef = useRef(0);

  useEffect(() => {
    // 1. CREATE THE CONTROL ONLY ONCE
    if (!routingControlRef.current) {
      const routingControl = L.Routing.control({
        waypoints: [],
        lineOptions: { styles: [{ color: '#6FA1EC', weight: 4 }] },
        show: false,
        addWaypoints: false,
        routeWhileDragging: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
      }).on('routesfound', (e) => {
        // --- THE CANCELLATION CHECK ---
        // If the current request ID doesn't match the one from this closure,
        // it means a newer request has been made or it has been reset. Ignore this callback.
        if (e.routes[0].inputWaypoints[0].name === '' || requestRef.current !== e.routes[0].inputWaypoints[0].name) {
          return;
        }

        const route = e.routes[0];
        if (onRouteFound) {
          onRouteFound({
            distance: (route.summary.totalDistance / 1000).toFixed(2),
            time: Math.round(route.summary.totalTime / 60),
          });
        }
      });
      routingControlRef.current = routingControl.addTo(map);
    }

    // 2. UPDATE WAYPOINTS WHEN PROPS CHANGE
    if (start && end) {
      // Generate a unique ID for this request
      const requestId = `route_${Date.now()}`;
      requestRef.current = requestId;

      routingControlRef.current.setWaypoints([
        // We pass the requestId as a "name" to check in the callback
        L.latLng(start[0], start[1], requestId), 
        L.latLng(end[0], end[1]),
      ]);
    } else {
      // When resetting, invalidate any pending requests
      requestRef.current = 0; 
      const waypoints = routingControlRef.current.getWaypoints();
      if (waypoints.length > 0) {
        routingControlRef.current.setWaypoints([]);
        if (onReset) onReset();
      }
    }
  }, [map, start, end, onRouteFound, onReset]);

  return null;
};


const Map = ({ theme }) => {
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
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPointA([latitude, longitude]);
          if (mapRef.current) {
            mapRef.current.flyTo([latitude, longitude], 13);
          }
        },
        () => alert("Could not get your location.")
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
        {!pointA && <p>Click map or use location for Point A.</p>}
        {pointA && !pointB && <p>Point A set. Click map for Point B.</p>}
        
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
        ref={mapRef}
      >
        <TileLayer url={tileLayers[theme]} attribution={attribution} />
        <MapClickHandler />

        {/* The Routing component is now rendered UNCONDITIONALLY */}
        <Routing
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