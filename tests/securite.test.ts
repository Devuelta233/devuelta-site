// Sécurité : double authentification (vecteurs officiels RFC 4226 / 6238),
// mots de passe, nettoyage des entrées.

import { describe, expect, it } from 'vitest';
import { hashPassword, iterationsDepuis, iterationsDuHash, temporaryPassword, verifyPassword } from '../server/crypto';
import { checkPasswordPolicy } from '../server/outil/auth';
import { base32Decode, base32Encode, hotp, otpauthUri, verifyTotp } from '../server/totp';
import { cleanEmail, cleanPhone, cleanText, cleanUrls, normalizeUrl } from '../server/util';

const SECRET = new TextEncoder().encode('12345678901234567890');

describe('HOTP (RFC 4226, annexe D)', () => {
  const attendus = ['755224', '287082', '359152', '969429', '338314', '254676', '287922', '162583', '399871', '520489'];
  attendus.forEach((code, compteur) => {
    it(`compteur ${compteur}`, async () => {
      expect(await hotp(SECRET, compteur)).toBe(code);
    });
  });
});

describe('TOTP (RFC 6238, annexe B, SHA-1)', () => {
  const vecteurs: Array<[number, string]> = [
    [59, '94287082'],
    [1111111109, '07081804'],
    [1111111111, '14050471'],
    [1234567890, '89005924'],
    [2000000000, '69279037'],
    [20000000000, '65353130'],
  ];
  for (const [t, code] of vecteurs) {
    it(`T = ${t}`, async () => {
      expect(await hotp(SECRET, Math.floor(t / 30), 8)).toBe(code);
    });
  }
});

describe('vérification des codes à 6 chiffres', () => {
  const b32 = base32Encode(SECRET);
  it('base32 aller-retour', () => {
    expect(b32).toBe('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
    expect(Array.from(base32Decode(b32))).toEqual(Array.from(SECRET));
  });
  it('accepte le code courant et refuse sa réutilisation', async () => {
    const maintenant = 59_000;
    const c = await verifyTotp(b32, '287082', 0, maintenant);
    expect(c).toBe(1);
    expect(await verifyTotp(b32, '287082', 1, maintenant)).toBeNull();
  });
  it('tolère 30 secondes de décalage, pas plus', async () => {
    expect(await verifyTotp(b32, '287082', 0, 89_000)).toBe(1); // pas suivant
    expect(await verifyTotp(b32, '287082', 0, 120_000)).toBeNull(); // deux pas plus tard
  });
  it('refuse les formats invalides', async () => {
    expect(await verifyTotp(b32, '28708', 0, 59_000)).toBeNull();
    expect(await verifyTotp(b32, 'abcdef', 0, 59_000)).toBeNull();
  });
  it('adresse otpauth pour l’application', () => {
    const u = otpauthUri(b32, 'team.devuelta@protonmail.com');
    expect(u.startsWith('otpauth://totp/EraseOps%3Ateam.devuelta%40protonmail.com?')).toBe(true);
    expect(u).toContain('issuer=EraseOps');
  });
});

describe('mots de passe', () => {
  it('empreinte vérifiable, itérations inscrites', async () => {
    const h = await hashPassword('une phrase assez longue', 10_000);
    expect(h.startsWith('pbkdf2-sha256$10000$')).toBe(true);
    expect(iterationsDuHash(h)).toBe(10_000);
    expect(await verifyPassword('une phrase assez longue', h)).toBe(true);
    expect(await verifyPassword('une phrase assez longuE', h)).toBe(false);
  });
  it('deux empreintes du même mot de passe diffèrent (sel)', async () => {
    expect(await hashPassword('identique-identique')).not.toBe(await hashPassword('identique-identique'));
  });
  it('empreintes malformées refusées', async () => {
    expect(await verifyPassword('x', '')).toBe(false);
    expect(await verifyPassword('x', 'md5$1$a$b')).toBe(false);
    expect(await verifyPassword('x', 'pbkdf2-sha256$99999999$AAAA$AAAA')).toBe(false);
  });
  it('itérations bornées', () => {
    expect(iterationsDepuis(undefined)).toBe(10_000);
    expect(iterationsDepuis('5000')).toBe(10_000);
    expect(iterationsDepuis('100000')).toBe(100_000);
    expect(iterationsDepuis('abc')).toBe(10_000);
  });
  it('mot de passe provisoire lisible, sans caractère ambigu', () => {
    for (let i = 0; i < 200; i++) {
      const p = temporaryPassword();
      expect(p).toMatch(/^[a-hjkmnp-z2-9]{4}(-[a-hjkmnp-z2-9]{4}){3}$/);
    }
  });
  it('politique : longueur, prévisibilité, variété', () => {
    const email = 'paola@example.com';
    expect(() => checkPasswordPolicy('court', email)).toThrow('mdp-trop-court');
    expect(() => checkPasswordPolicy('paola-et-son-chat', email)).toThrow('mdp-trop-simple');
    expect(() => checkPasswordPolicy('mon-motdepasse-a-moi', email)).toThrow('mdp-trop-simple');
    expect(() => checkPasswordPolicy('aaaaaabbbbbbcc', email)).toThrow('mdp-trop-simple');
    expect(() => checkPasswordPolicy('Le soleil se lève sur Accra', email)).not.toThrow();
  });
});

describe('nettoyage des entrées', () => {
  it('téléphones au format international', () => {
    expect(cleanPhone('+41 78 316 93 06')).toBe('+41783169306');
    expect(cleanPhone('0041 76 823 24 68')).toBe('+41768232468');
    expect(cleanPhone('+233 59 215 11 39')).toBe('+233592151139');
    expect(() => cleanPhone('appelle-moi')).toThrow('telephone-invalide');
  });
  it('e-mails', () => {
    expect(cleanEmail(' Team.Devuelta@ProtonMail.com ')).toBe('team.devuelta@protonmail.com');
    expect(() => cleanEmail('pas-un-email')).toThrow('email-invalide');
  });
  it('liens : http(s) seulement, sans identifiants', () => {
    expect(normalizeUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeUrl('data:text/html,x')).toBeNull();
    expect(normalizeUrl('https://user:pass@exemple.com/')).toBeNull();
    expect(normalizeUrl('localhost')).toBeNull();
    expect(normalizeUrl('exemple.com/page')).toBe('https://exemple.com/page');
    expect(cleanUrls('https://a.com/x https://a.com/x  b.org')).toEqual(['https://a.com/x', 'https://b.org/']);
    expect(() => cleanUrls(['ftp://a.com'])).toThrow();
  });
  it('textes : caractères de contrôle retirés, longueur bornée', () => {
    expect(cleanText('a\u0000b', 10)).toBe('a b');
    expect(cleanText('ligne1\r\nligne2', 50, { multiline: true })).toBe('ligne1\nligne2');
    expect(() => cleanText('x'.repeat(11), 10)).toThrow('champ-trop-long');
    expect(() => cleanText('', 10, { required: true })).toThrow('champ-manquant');
  });
});
