import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import App from './src/App.jsx';

// Polyfill window to mock Capacitor
global.window = {
  Capacitor: {
    isNativePlatform: () => true
  },
  innerWidth: 400,
  location: { search: "" },
  addEventListener: () => {},
  removeEventListener: () => {},
  scrollTo: () => {}
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};
global.sessionStorage = {
  getItem: () => "true",
  setItem: () => {}
};
global.document = {
  documentElement: { scrollHeight: 1000 }
};

try {
  // we have to mock BrowserRouter inside App.jsx by replacing it or just testing App directly!
  // BUT App.jsx HAS BrowserRouter hardcoded inside it. 
  // We can't render it in a Node env without DOM unless we use a fake DOM like JSDOM.
} catch (err) {
  console.error("Render failed", err);
}
