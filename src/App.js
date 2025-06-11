// src/App.js
import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './components/Login';
import MapPage from './components/MapPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Bonus: Loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Stop loading once we know the auth state
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading...</div>; // Simple loading indicator
  }

  return (
    <div className="App">
      {user ? <MapPage /> : <Login />}
    </div>
  );
}

export default App;