// src/components/Login.js
import React from 'react';
import { signInWithGoogle } from '../firebase';
import './Login.css'; // We'll create this for styling

const Login = () => {
  return (
    <div className="login-container">
      <h2>Authenticated Map App</h2>
      <p>Please sign in to continue</p>
      <button className="login-button" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;