// Paiement en ligne (Paystack) : le vrai code, sur une vraie base SQLite en
// mémoire (mêmes migrations que la base D1), avec un Paystack simulé.
// Vérifie : lien de paiement, signature des notifications, confirmation
// (notification, retour du client, filet du matin), montants anormaux,
// séparation entre clé de test et vraie clé.

import { createHmac } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { lienPaiement, modeTest, signatureValide, verifierEnAttente, verifierRetour, webhookPaystack } from '../server/paiement';
import { ensureSchema } from '../server/schema';
import { HttpError, type Env } from '../server/util';

const CLE_TEST = 'sk_test_cle_factice_pour_les_essais';
const CLE_VRAIE = 'sk_live_cle_factice_pour_les_essais';
const TAUX = 15; // 1 € = 15 GHS (taux simulé)

// Base SQLite en mémoire présentée comme une base D1 (prepare / bind / first / all / run / batch).
function baseD1(): D1Database {
  const db = new DatabaseSync(':memory:');
  type Valeur = string | number | null;
  const stmt = (sql: string, args: Valeur[] = []) => ({
    bind: (...a: Valeur[]) => stmt(sql, a),
    first: async () => db.prepare(sql).get(...args) ?? null,
    all: async () => ({ results: db.prepare(sql).all(...args) }),
    run: async () => ({ meta: { changes: Number(db.prepare(sql).run(...args).changes) } }),
  });
  return {
    prepare: (sql: string) => stmt(sql),
    batch: async (liste: Array<{ run: () => Promise<unknown> }>) => {
      const out = [];
      for (const s of liste) out.push(await s.run());
      return out;
    },
  } as unknown as D1Database;
}

const DB = baseD1();
const env = (cle?: string): Env => ({ DB, ASSETS: {} as Fetcher, PAYSTACK_SECRET_KEY: cle, PAIEMENT_DEVISE: 'GHS' });

// Paystack simulé : ce qu'il répond à la vérification, et les appels reçus.
let reponseVerif: { status: string; amount: number; currency: string } | null = null;
const appels: Array<{ url: string; corps: Record<string, unknown> | null }> = [];

function simulerPaystack() {
  vi.stubGlobal('fetch', async (entree: string | URL, init?: RequestInit) => {
    const url = String(entree);
    appels.push({ url, corps: init?.body ? JSON.parse(String(init.body)) : null });
    if (url.startsWith('https://open.er-api.com/')) return Response.json({ result: 'success', rates: { GHS: TAUX } });
    if (url === 'https://api.paystack.co/transaction/initialize') {
      const ref = (JSON.parse(String(init?.body)) as { reference: string }).reference;
      return Response.json({ status: true, data: { authorization_url: `https://checkout.paystack.com/${ref}` } });
    }
    if (url.startsWith('https://api.paystack.co/transaction/verify/')) {
      return Response.json(reponseVerif ? { status: true, data: { ...reponseVerif, channel: 'card' } } : { status: false, message: 'Transaction reference not found' });
    }
    return new Response('inattendu', { status: 500 });
  });
}

async function creerDossier(ref: string): Promise<string> {
  const id = `id-${ref}`;
  const now = new Date().toISOString();
  await DB.prepare(
    "INSERT INTO dossiers (id, ref, cree_le, maj_le, langue, situation, client_pseudo, client_email, mandat_signe_le) VALUES (?, ?, ?, ?, 'fr', 'faux-compte', 'Awa', 'awa@example.org', ?)",
  )
    .bind(id, ref, now, now, now.slice(0, 10))
    .run();
  return id;
}

const paiement = (reference: string) =>
  DB.prepare('SELECT statut, test, montant_devise, canal FROM paiements WHERE reference = ?').bind(reference).first<{ statut: string; test: number; montant_devise: number; canal: string | null }>();
const anomalies = async (dossierId: string) =>
  (await DB.prepare("SELECT COUNT(*) AS n FROM journal WHERE action = 'paiement-anomalie' AND dossier_id = ?").bind(dossierId).first<{ n: number }>())?.n;
const referenceDe = (lien: string) => lien.split('/').pop() as string;
const retour = async (e: Env, reference: string) =>
  ((await (await verifierRetour(new Request(`https://getdevuelta.com/api/paiement/verifier?trxref=${reference}&reference=${reference}`), e)).json()) as { statut: string }).statut;

beforeAll(async () => {
  await ensureSchema(DB);
});

afterEach(() => {
  vi.unstubAllGlobals();
  reponseVerif = null;
  appels.length = 0;
});

describe('Paystack : clé et signature', () => {
  it('clé de test reconnue, vraie clé non, pas de clé non plus', () => {
    expect(modeTest(env(CLE_TEST))).toBe(true);
    expect(modeTest(env(CLE_VRAIE))).toBe(false);
    expect(modeTest(env())).toBe(false);
  });

  it('signature des notifications : HMAC SHA-512 du corps avec la clé secrète', async () => {
    const corps = JSON.stringify({ event: 'charge.success', data: { reference: 'DV-1-O-abc123' } });
    const bonne = createHmac('sha512', CLE_TEST).update(corps).digest('hex');
    expect(await signatureValide(CLE_TEST, corps, bonne)).toBe(true);
    expect(await signatureValide(CLE_TEST, corps, bonne.toUpperCase())).toBe(true);
    expect(await signatureValide(CLE_TEST, corps + ' ', bonne)).toBe(false);
    expect(await signatureValide(CLE_VRAIE, corps, bonne)).toBe(false);
    expect(await signatureValide(CLE_TEST, corps, null)).toBe(false);
    expect(await signatureValide(CLE_TEST, corps, '')).toBe(false);
  });
});

describe('Paystack : du lien au paiement confirmé', () => {
  it('lien de paiement : montant converti en pesewas, devise, adresse de retour, repris au 2e appel', async () => {
    simulerPaystack();
    const dossier = await creerDossier('DV-T-0001');
    const l = await lienPaiement(env(CLE_TEST), { dossierId: dossier, ref: 'DV-T-0001', lang: 'es', email: 'awa@example.org', type: 'ouverture', montantEur: 20 });
    expect(l?.devise).toBe('GHS');
    expect(l?.montantDevise).toBe(20 * TAUX * 100);
    const init = appels.find((a) => a.url.endsWith('/transaction/initialize'));
    expect(init?.corps).toMatchObject({ amount: 30000, currency: 'GHS', email: 'awa@example.org', callback_url: 'https://getdevuelta.com/es/pago-recibido/' });
    expect((await paiement(referenceDe(l!.lien)))?.test).toBe(1);
    // Même demande dans la foulée : même lien, Paystack n'est pas rappelé.
    const encore = await lienPaiement(env(CLE_TEST), { dossierId: dossier, ref: 'DV-T-0001', lang: 'es', email: 'awa@example.org', type: 'ouverture', montantEur: 20 });
    expect(encore?.lien).toBe(l?.lien);
    expect(appels.filter((a) => a.url.endsWith('/transaction/initialize'))).toHaveLength(1);
  });

  it('sans clé : aucun lien, rien n’est demandé à Paystack', async () => {
    simulerPaystack();
    const dossier = await creerDossier('DV-T-0002');
    expect(await lienPaiement(env(), { dossierId: dossier, ref: 'DV-T-0002', lang: 'fr', email: 'awa@example.org', type: 'ouverture', montantEur: 40 })).toBeNull();
    expect(appels).toHaveLength(0);
  });

  it('notification signée : le paiement passe à « payé » après vérification auprès de Paystack', async () => {
    simulerPaystack();
    const dossier = await creerDossier('DV-T-0003');
    const l = await lienPaiement(env(CLE_TEST), { dossierId: dossier, ref: 'DV-T-0003', lang: 'fr', email: 'awa@example.org', type: 'ouverture', montantEur: 40 });
    const reference = referenceDe(l!.lien);
    reponseVerif = { status: 'success', amount: 40 * TAUX * 100, currency: 'GHS' };
    const corps = JSON.stringify({ event: 'charge.success', data: { reference } });
    const enCours: Promise<unknown>[] = [];
    const ctx = { waitUntil: (p: Promise<unknown>) => enCours.push(p), passThroughOnException() {} } as unknown as ExecutionContext;
    const signature = createHmac('sha512', CLE_TEST).update(corps).digest('hex');
    const r = await webhookPaystack(new Request('https://getdevuelta.com/api/paiement/paystack', { method: 'POST', body: corps, headers: { 'x-paystack-signature': signature } }), env(CLE_TEST), ctx);
    expect(r.status).toBe(200);
    await Promise.all(enCours);
    expect(await paiement(reference)).toMatchObject({ statut: 'paye', canal: 'card' });
    // Le retour du client le voit aussitôt comme payé.
    expect(await retour(env(CLE_TEST), reference)).toBe('paye');
  });

  it('notification mal signée : refusée, rien ne change', async () => {
    simulerPaystack();
    const corps = JSON.stringify({ event: 'charge.success', data: { reference: 'DV-T-9999-O-000000' } });
    const ctx = { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext;
    const essai = webhookPaystack(
      new Request('https://getdevuelta.com/api/paiement/paystack', { method: 'POST', body: corps, headers: { 'x-paystack-signature': 'faux' } }),
      env(CLE_TEST),
      ctx,
    );
    await expect(essai).rejects.toBeInstanceOf(HttpError);
    expect(appels).toHaveLength(0);
  });

  it('retour du client sans notification : confirmé directement auprès de Paystack', async () => {
    simulerPaystack();
    const dossier = await creerDossier('DV-T-0004');
    const l = await lienPaiement(env(CLE_TEST), { dossierId: dossier, ref: 'DV-T-0004', lang: 'en', email: 'awa@example.org', type: 'ouverture', montantEur: 40 });
    const reference = referenceDe(l!.lien);
    reponseVerif = { status: 'abandoned', amount: 40 * TAUX * 100, currency: 'GHS' };
    expect(await retour(env(CLE_TEST), reference)).toBe('en-attente');
    reponseVerif = { status: 'success', amount: 40 * TAUX * 100, currency: 'GHS' };
    expect(await retour(env(CLE_TEST), reference)).toBe('paye');
    expect((await paiement(reference))?.statut).toBe('paye');
  });

  it('retour avec une référence inconnue ou bizarre : « inconnu », sans appeler Paystack', async () => {
    simulerPaystack();
    expect(await retour(env(CLE_TEST), 'DV-T-0000-O-ffffff')).toBe('inconnu');
    expect(await retour(env(CLE_TEST), '../../etc')).toBe('inconnu');
    expect(await retour(env(), 'DV-T-0004-O-ffffff')).toBe('inconnu');
    expect(appels).toHaveLength(0);
  });

  it('payé mais pas le bon montant : marqué « anomalie » une seule fois, jamais « payé »', async () => {
    simulerPaystack();
    const dossier = await creerDossier('DV-T-0005');
    const l = await lienPaiement(env(CLE_TEST), { dossierId: dossier, ref: 'DV-T-0005', lang: 'fr', email: 'awa@example.org', type: 'ouverture', montantEur: 40 });
    const reference = referenceDe(l!.lien);
    reponseVerif = { status: 'success', amount: 100, currency: 'GHS' };
    expect(await retour(env(CLE_TEST), reference)).toBe('en-attente');
    expect(await retour(env(CLE_TEST), reference)).toBe('en-attente');
    expect((await paiement(reference))?.statut).toBe('anomalie');
    expect(await anomalies(dossier)).toBe(1);
  });

  it('un lien de test ne devient jamais « payé » avec la vraie clé (et le vrai lien n’en reprend pas un de test)', async () => {
    simulerPaystack();
    const dossier = await creerDossier('DV-T-0006');
    const test = await lienPaiement(env(CLE_TEST), { dossierId: dossier, ref: 'DV-T-0006', lang: 'fr', email: 'awa@example.org', type: 'ouverture', montantEur: 40 });
    reponseVerif = { status: 'success', amount: 40 * TAUX * 100, currency: 'GHS' };
    appels.length = 0;
    expect(await retour(env(CLE_VRAIE), referenceDe(test!.lien))).toBe('en-attente');
    expect(appels).toHaveLength(0);
    const vrai = await lienPaiement(env(CLE_VRAIE), { dossierId: dossier, ref: 'DV-T-0006', lang: 'fr', email: 'awa@example.org', type: 'ouverture', montantEur: 40 });
    expect(vrai?.lien).not.toBe(test?.lien);
    expect((await paiement(referenceDe(vrai!.lien)))?.test).toBe(0);
  });

  it('filet du matin : les liens en attente sont redemandés à Paystack', async () => {
    simulerPaystack();
    const dossier = await creerDossier('DV-T-0007');
    const l = await lienPaiement(env(CLE_VRAIE), { dossierId: dossier, ref: 'DV-T-0007', lang: 'fr', email: 'awa@example.org', type: 'ouverture', montantEur: 80 });
    reponseVerif = { status: 'success', amount: 80 * TAUX * 100, currency: 'GHS' };
    const r = await verifierEnAttente(env(CLE_VRAIE));
    expect(r.payes).toBeGreaterThanOrEqual(1);
    expect((await paiement(referenceDe(l!.lien)))?.statut).toBe('paye');
    expect(await verifierEnAttente(env())).toEqual({ verifies: 0, payes: 0 });
  });
});
