// src/components/MapPage.js
import React from 'react';
import { auth } from '../firebase';

const MapPage = () => {
  return (
    <div>
      <h1>Welcome to the Map</h1>
      <button onClick={() => auth.signOut()}>Sign Out</button>
      {/* Map will go here later */}
    </div>
  );
};

export default MapPage;