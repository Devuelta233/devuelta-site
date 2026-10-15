import { render } from 'preact';
import { typoProfonde } from '../../shared/typo';
import { Diagnostic, type DonneesDiagnostic } from './Diagnostic';

const zone = document.getElementById('diagnostic');
const source = document.getElementById('donnees-diagnostic');
if (zone && source) {
  const d = typoProfonde(JSON.parse(source.textContent || '{}') as DonneesDiagnostic);
  zone.textContent = '';
  render(<Diagnostic d={d} />, zone);
}
