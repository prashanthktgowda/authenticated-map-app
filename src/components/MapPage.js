// src/components/MapPage.js
import React from 'react';
import { auth } from '../firebase';
import Map from './Map';
import './MapPage.css';
import { FaSun, FaMoon } from 'react-icons/fa'; // Icons for theme toggle

const MapPage = ({ theme, toggleTheme }) => {
  const user = auth.currentUser;

  return (
    <div className="map-page-container">
      <header className="map-page-header">
        <h1>Route Plotter</h1>
        <div className="controls-container">
          <div className="user-info">
            <span>Hi, {user.displayName || 'User'}!</span>
            <button onClick={() => auth.signOut()} className="sign-out-button">
              Sign Out
            </button>
          </div>
          <button onClick={toggleTheme} className="theme-toggle-button">
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
        </div>
      </header>
      <main className="map-content">
        <Map theme={theme} />
      </main>
    </div>
  );
};

export default MapPage;