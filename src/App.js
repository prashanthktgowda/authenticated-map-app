// src/App.js
import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './components/Login';
import MapPage from './components/MapPage';
import Spinner from './components/Spinner'; // Import Spinner
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
  };

  // Add a class to the body for global theme styles
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);


  if (loading) {
    return <Spinner />; // Use the new spinner
  }

  return (
    <div className={`App ${theme}`}>
      {user ? (
        <MapPage theme={theme} toggleTheme={toggleTheme} />
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;