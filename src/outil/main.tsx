// Démarrage de l'outil interne dans la page /outil/.

import { render } from 'preact';
import { App } from './App';
import './outil.css';

const zone = document.getElementById('outil');
if (zone) {
  zone.textContent = '';
  render(<App />, zone);
}
