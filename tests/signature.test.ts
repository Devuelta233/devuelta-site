// Signature en ligne (devis + mandat) et e-mails automatiques.

import { describe, expect, it } from 'vitest';
import { emailDemandeRecue, emailLienPaiement, emailPaiementRecu, emailSigne, noteDevise, sujetAccuse, sujetSignature } from '../shared/emails';
import { DESCRIPTION_GENERIQUE, NOM_A_SIGNER, documentSigne, mandatPourSignature, messageSignature, texteDevis } from '../shared/signature';
import { calculerPrix } from '../shared/tarifs';
import { LANGS, type Lang } from '../shared/vocab';
import { contientMarqueur, genererCourrier, trouverModele } from '../server/outil/modeles';

const INTERDITS = /garanti|guarantee|garantiz|conseil juridique|asesoramiento jur[ií]dico|legal advice/i;
// Le mandat dit lui-même qu'il n'y a « pas de conseil juridique » : seules les promesses sont exclues.
const PROMESSE = /garanti|guarantee|garantiz/i;
const URL_CGV = 'https://getdevuelta.com/conditions-de-vente/';

function documentPour(lang: Lang, publieParSoi: number | null = null) {
  const prix = calculerPrix(3, 0, 'standard');
  const modele = trouverModele('mandat', lang)!;
  const { corps } = genererCourrier({
    modele,
    dossier: { ref: 'DV-2026-0007', client_nom: NOM_A_SIGNER[lang], pays: 'FR', publie_par_soi: publieParSoi },
    urls: ['https://exemple.com/a', 'https://exemple.com/b', 'https://exemple.com/c'],
    representant: 'Paola',
    description_contenu: DESCRIPTION_GENERIQUE[lang],
  });
  return `${texteDevis({ ref: 'DV-2026-0007', nbLiens: 3, prix, urlConditions: URL_CGV }, lang)}\n\n${mandatPourSignature(corps, lang)}`;
}

describe('document à signer', () => {
  for (const lang of LANGS) {
    it(`${lang} : devis + mandat complets, sans lignes de signature papier`, () => {
      for (const publie of [null, 0, 1]) {
        const doc = documentPour(lang, publie);
        expect(contientMarqueur(doc), doc).toBe(false);
        expect(doc).toContain('DV-2026-0007');
        expect(doc).toContain(URL_CGV);
        expect(doc).toContain(NOM_A_SIGNER[lang]);
        expect(doc).not.toContain('____');
        expect(doc).not.toMatch(PROMESSE);
      }
    });

    it(`${lang} : une fois signé, le nom remplace « à signer » et la preuve est ajoutée`, () => {
      const signe = documentSigne(
        documentPour(lang),
        { nom: 'Awa Diallo', signeLe: '2026-10-16T13:42:00.000Z', quand: '16/10/2026 13:42 GMT', debutImmediat: true, representant: 'Paola' },
        lang,
      );
      expect(signe).not.toContain(NOM_A_SIGNER[lang]);
      expect(signe).toContain('Awa Diallo');
      expect(signe).toContain('16/10/2026 13:42 GMT');
      expect(signe).toMatch(/oui|sí|yes/);
      expect(signe).toContain('Paola');
    });
  }

  it('plus de 15 liens : sur devis, pas de signature automatique', () => {
    const prix = calculerPrix(40, 0, 'standard');
    expect(() => texteDevis({ ref: 'DV-2026-0008', nbLiens: 40, prix, urlConditions: URL_CGV }, 'fr')).toThrow();
  });

  it('le message du lien est personnel et ne promet rien', () => {
    for (const lang of LANGS) {
      const m = messageSignature({ pseudo: 'Awa', ref: 'DV-2026-0007', url: 'https://getdevuelta.com/signer/#abc' }, lang);
      expect(m).toContain('https://getdevuelta.com/signer/#abc');
      expect(m).toContain('Team Devuelta');
      expect(m).not.toMatch(INTERDITS);
    }
  });
});

describe('e-mails automatiques', () => {
  for (const lang of LANGS) {
    it(`${lang} : accusé de réception de la demande, discret et utile`, () => {
      const sans = emailDemandeRecue({ pseudo: 'Awa', ref: 'D-2026-0042', menace: false }, lang);
      const avec = emailDemandeRecue({ pseudo: 'Awa', ref: 'D-2026-0042', menace: true }, lang);
      expect(sans.sujet).toContain('D-2026-0042');
      // L'objet ne dit jamais de quoi il s'agit.
      expect(sans.sujet).not.toMatch(/intime|íntim|intimate|chantage|chantaje|blackmail|photo|foto|faux|fake|falso/i);
      expect(sans.texte).toContain('Team Devuelta');
      expect(sans.texte).toMatch(/images intimes|imágenes íntimas|intimate images/);
      expect(sans.texte).toContain('https://getdevuelta.com/');
      expect(avec.texte.length).toBeGreaterThan(sans.texte.length);
      expect(sans.texte + avec.texte).not.toMatch(INTERDITS);
    });

    it(`${lang} : copie signée, avec le WhatsApp de la personne qui suit le dossier`, () => {
      const base = { pseudo: 'Awa', ref: 'DV-2026-0007', documentSigne: 'DOCUMENT SIGNÉ', ouverture: '29,50 €', debutImmediat: true };
      const avec = emailSigne({ ...base, prenom: 'Paola', whatsapp: '+41 78 000 00 00' }, lang);
      const sans = emailSigne({ ...base, prenom: null, whatsapp: null, debutImmediat: false }, lang);
      expect(avec.texte).toContain('+41 78 000 00 00');
      expect(avec.texte).toContain('Paola');
      expect(avec.texte).toContain('DOCUMENT SIGNÉ');
      expect(avec.texte).toContain('29,50 €');
      expect(sans.texte).not.toContain('WhatsApp');
      expect(sans.texte).toMatch(/14/);
      expect(avec.sujet).toContain('DV-2026-0007');
      expect(avec.texte + sans.texte).not.toMatch(INTERDITS);
    });

    it(`${lang} : objets des autres messages`, () => {
      expect(sujetSignature('DV-2026-0007', lang)).toContain('DV-2026-0007');
      expect(sujetAccuse('R-2026-0003', lang)).toContain('R-2026-0003');
    });
  }
});

describe('paiement en ligne', () => {
  for (const lang of LANGS) {
    it(`${lang} : lien de paiement et confirmation`, () => {
      const lien = emailLienPaiement({ pseudo: 'Awa', ref: 'DV-2026-0007', montant: '40 €', type: 'ouverture', lien: 'https://checkout.paystack.com/abc', devise: 'GHS' }, lang);
      expect(lien.texte).toContain('https://checkout.paystack.com/abc');
      expect(lien.texte).toContain('GHS');
      expect(lien.sujet).toContain('DV-2026-0007');
      const recu = emailPaiementRecu({ pseudo: 'Awa', ref: 'DV-2026-0007', montantEur: 40, type: 'ouverture' }, lang);
      expect(recu.texte).toMatch(/40/);
      expect(lien.texte + recu.texte).not.toMatch(INTERDITS);
      const signe = emailSigne(
        { pseudo: 'Awa', ref: 'DV-2026-0007', documentSigne: 'DOC', prenom: null, whatsapp: null, ouverture: '40 €', debutImmediat: true, lienPaiement: 'https://checkout.paystack.com/abc', devise: 'GHS' },
        lang,
      );
      expect(signe.texte).toContain('https://checkout.paystack.com/abc');
    });
  }
  it('pas de note de change quand on débite en euros', () => {
    expect(noteDevise('EUR', 'fr')).toBe('');
    expect(noteDevise(null, 'fr')).toBe('');
  });
});
