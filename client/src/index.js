import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles.css'
import { AuthProvider } from './context/auth-context';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);