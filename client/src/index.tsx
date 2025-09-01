import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Get the root element
const root = ReactDOM.createRoot(document.getElementById('root')!);

// Render the app WITHOUT StrictMode to prevent KAPLAY double initialization
root.render(
  <App />
);