// src/components/Map.js

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// --- Fix for default marker icon (NO CHANGE HERE) ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// --- Helper functions for formatting (NO CHANGE HERE) ---
const formatDistance = (meters) => {
    if (meters < 1000) return `${meters.toFixed(0)} meters`;
    return `${(meters / 1000).toFixed(2)} km`;
};
const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes.toFixed(0)} minutes`;
};


// --- THE NEW, ROBUST ROUTING COMPONENT ---
const RoutingMachine = ({ start, end, onRouteFound, onReset }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    // Create the routing control only once
    if (!routingControlRef.current) {
      const routingControl = L.Routing.control({
        // We will set waypoints dynamically
        waypoints: [],
        routeWhileDragging: false, // Turn off to have more control
        lineOptions: { styles: [{ color: '#6FA1EC', weight: 4 }] },
        show: false,
        addWaypoints: false,
      }).on('routesfound', (e) => {
        const route = e.routes[0];
        if (onRouteFound) {
          onRouteFound({
            distance: route.summary.totalDistance,
            time: route.summary.totalTime,
          });
        }
      });
      routingControlRef.current = routingControl.addTo(map);
    }

    // Update waypoints when start or end points change
    if (start && end) {
      routingControlRef.current.setWaypoints([
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1]),
      ]);
    } else if (!start && !end) {
        // This is our reset condition
        routingControlRef.current.setWaypoints([]);
        if (onReset) {
            onReset();
        }
    }

  }, [map, start, end, onRouteFound, onReset]);

  return null;
};


// --- THE MAP COMPONENT WITH UPDATED LOGIC ---
const Map = () => {
  const [pointA, setPointA] = useState(null);
  const [pointB, setPointB] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // MapClickHandler is a bit tricky with the new logic, let's simplify
  const MapEvents = () => {
      useMap().on('click', (e) => {
          if (!pointA) {
              setPointA([e.latlng.lat, e.latlng.lng]);
          } else if (!pointB) {
              setPointB([e.latlng.lat, e.latlng.lng]);
          }
      });
      return null;
  }

  const handleReset = () => {
    setPointA(null);
    setPointB(null);
    // The RoutingMachine will see the null points and reset itself
  }

  const handleLocateMe = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPointA([latitude, longitude]);
        setIsLocating(false);
      },
      () => {
        alert("Could not get your location.");
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="map-wrapper">
        <div className="map-controls">
            <h3>Plot a Route</h3>
            <div className="instructions">
                {!pointA && <p>1. Click the map to set Point A, or use your current location.</p>}
                {pointA && !pointB && <p>2. Click the map to set Point B.</p>}
            </div>

            <div className="buttons-container">
                <button onClick={handleLocateMe} disabled={isLocating || pointA}>
                    {isLocating ? 'Locating...' : 'Use My Location for A'}
                </button>
                <button onClick={handleReset} disabled={!pointA && !pointB}>
                    Reset
                </button>
            </div>
            
            {routeInfo && (
                <div className="route-info">
                    <h4>Route Details</h4>
                    <p><strong>Distance:</strong> {formatDistance(routeInfo.distance)}</p>
                    <p><strong>Estimated Time:</strong> {formatTime(routeInfo.time)}</p>
                </div>
            )}
        </div>

        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapEvents />
          {/* We now render RoutingMachine unconditionally */}
          <RoutingMachine 
            start={pointA} 
            end={pointB} 
            onRouteFound={setRouteInfo}
            onReset={() => setRouteInfo(null)} // Clear info on reset
          />

          {pointA && <Marker position={pointA}><Popup>Point A</Popup></Marker>}
          {pointB && <Marker position={pointB}><Popup>Point B</Popup></Marker>}
        </MapContainer>
    </div>
  );
};

export default Map;