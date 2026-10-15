import { render } from 'preact';
import { typoProfonde } from '../../shared/typo';
import { Confier, type DonneesConfier } from './Confier';

const zone = document.getElementById('confier');
const source = document.getElementById('donnees-confier');
if (zone && source) {
  const d = typoProfonde(JSON.parse(source.textContent || '{}') as DonneesConfier);
  zone.textContent = '';
  render(<Confier d={d} />, zone);
}
