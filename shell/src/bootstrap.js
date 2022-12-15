import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import App from './components/App';

const render = App => {
  const root = document.getElementById('root');
  const state = window.pageState
  ReactDOMClient.hydrateRoot(root, <App {...state} />);
};

render(App);