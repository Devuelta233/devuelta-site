import { render } from 'preact';
import { Signature, type DonneesSignature } from './Signature';

const zone = document.getElementById('signature');
const source = document.getElementById('donnees-signature');
if (zone && source) {
  const d = JSON.parse(source.textContent || '{}') as DonneesSignature;
  zone.textContent = '';
  render(<Signature d={d} />, zone);
}
