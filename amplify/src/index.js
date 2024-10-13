import { Amplify } from 'aws-amplify';
import amplifyconfig from './amplifyconfiguration.json';
import App from './App';
import React from 'react';
import ReactDOM from 'react-dom/client';

Amplify.configure(amplifyconfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);