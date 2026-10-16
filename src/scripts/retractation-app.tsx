import { render } from 'preact';
import { Retractation, type DonneesRetractation } from './Retractation';

const zone = document.getElementById('retractation');
const source = document.getElementById('donnees-retractation');
if (zone && source) {
  const d = JSON.parse(source.textContent || '{}') as DonneesRetractation;
  zone.textContent = '';
  render(<Retractation d={d} />, zone);
}
