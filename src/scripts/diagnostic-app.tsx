import { render } from 'preact';
import { Diagnostic, type DonneesDiagnostic } from './Diagnostic';

const zone = document.getElementById('diagnostic');
const source = document.getElementById('donnees-diagnostic');
if (zone && source) {
  const d = JSON.parse(source.textContent || '{}') as DonneesDiagnostic;
  zone.textContent = '';
  render(<Diagnostic d={d} />, zone);
}
