// Structure de la base (Cloudflare D1), appliquée automatiquement par le
// moteur au premier passage : pour faire évoluer la base, on AJOUTE une
// migration à la fin de la liste, on ne modifie jamais une migration passée.
// Dates en ISO 8601 UTC (texte). Identifiants : UUID texte.

// Colonnes de la table des demandes, recopiées telles quelles par la migration 9.
const COLONNES_DEMANDES =
  'id, ref, recue_le, langue, pays, situation, plateformes, liens, message, pseudo, contact_mode, contact_valeur, menace, ' +
  'deja_signale, publie_par_soi, consentement_version, consentement_le, statut, assigne_a, traitee_par, traitee_le, ' +
  'note_traitement, dossier_id, ip_hash';
// Par prudence, un membre introuvable devient « personne » plutôt que de bloquer la copie.
const COPIE_DEMANDES = COLONNES_DEMANDES.replace('assigne_a', '(SELECT u.id FROM utilisateurs u WHERE u.id = demandes.assigne_a)').replace(
  'traitee_par',
  '(SELECT u.id FROM utilisateurs u WHERE u.id = demandes.traitee_par)',
);

export const MIGRATIONS: string[][] = [
  // 1 — schéma initial
  [
    `CREATE TABLE IF NOT EXISTS utilisateurs (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      nom TEXT NOT NULL,
      langue TEXT NOT NULL DEFAULT 'fr' CHECK (langue IN ('fr','es','en')),
      role TEXT NOT NULL DEFAULT 'membre' CHECK (role IN ('admin','membre')),
      mdp_hash TEXT NOT NULL,
      mdp_a_changer INTEGER NOT NULL DEFAULT 1,
      totp_secret TEXT,
      totp_actif INTEGER NOT NULL DEFAULT 0,
      totp_dernier_compteur INTEGER NOT NULL DEFAULT 0,
      nda_version TEXT,
      nda_accepte_le TEXT,
      actif INTEGER NOT NULL DEFAULT 1,
      echecs INTEGER NOT NULL DEFAULT 0,
      bloque_jusqua TEXT,
      cree_le TEXT NOT NULL,
      derniere_connexion TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      id_hash TEXT PRIMARY KEY,
      utilisateur_id TEXT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
      mfa INTEGER NOT NULL DEFAULT 0,
      complet_le TEXT,
      cree_le TEXT NOT NULL,
      expire_le TEXT NOT NULL,
      vu_le TEXT NOT NULL,
      ip TEXT,
      pays TEXT,
      agent TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(utilisateur_id)`,
    `CREATE TABLE IF NOT EXISTS connexions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      utilisateur_id TEXT REFERENCES utilisateurs(id) ON DELETE CASCADE,
      email TEXT,
      le TEXT NOT NULL,
      resultat TEXT NOT NULL,
      ip TEXT,
      pays TEXT,
      ville TEXT,
      reseau TEXT,
      agent TEXT,
      nouveau_pays INTEGER NOT NULL DEFAULT 0
    )`,
    `CREATE INDEX IF NOT EXISTS idx_connexions_user ON connexions(utilisateur_id, le)`,
    `CREATE INDEX IF NOT EXISTS idx_connexions_ip ON connexions(ip, le)`,
    `CREATE TABLE IF NOT EXISTS parametres (cle TEXT PRIMARY KEY, valeur TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS compteurs (nom TEXT PRIMARY KEY, valeur INTEGER NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS demandes (
      id TEXT PRIMARY KEY,
      ref TEXT NOT NULL UNIQUE,
      recue_le TEXT NOT NULL,
      langue TEXT NOT NULL,
      pays TEXT,
      situation TEXT NOT NULL,
      plateformes TEXT,
      liens TEXT,
      message TEXT,
      pseudo TEXT NOT NULL,
      contact_mode TEXT NOT NULL CHECK (contact_mode IN ('email','whatsapp')),
      contact_valeur TEXT NOT NULL,
      menace INTEGER NOT NULL DEFAULT 0,
      deja_signale INTEGER NOT NULL DEFAULT 0,
      publie_par_soi INTEGER,
      consentement_version TEXT NOT NULL,
      consentement_le TEXT NOT NULL,
      statut TEXT NOT NULL DEFAULT 'nouvelle',
      assigne_a TEXT REFERENCES utilisateurs(id) ON DELETE SET NULL,
      traitee_par TEXT REFERENCES utilisateurs(id) ON DELETE SET NULL,
      traitee_le TEXT,
      note_traitement TEXT,
      dossier_id TEXT,
      ip_hash TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_demandes_statut ON demandes(statut, recue_le)`,
    `CREATE INDEX IF NOT EXISTS idx_demandes_ip ON demandes(ip_hash, recue_le)`,
    `CREATE TABLE IF NOT EXISTS dossiers (
      id TEXT PRIMARY KEY,
      ref TEXT NOT NULL UNIQUE,
      cree_le TEXT NOT NULL,
      maj_le TEXT NOT NULL,
      cree_par TEXT REFERENCES utilisateurs(id) ON DELETE SET NULL,
      statut TEXT NOT NULL DEFAULT 'ouvert',
      priorite TEXT NOT NULL DEFAULT 'normal',
      menace INTEGER NOT NULL DEFAULT 0,
      langue TEXT NOT NULL,
      pays TEXT,
      situation TEXT NOT NULL,
      assigne_a TEXT REFERENCES utilisateurs(id) ON DELETE SET NULL,
      client_pseudo TEXT NOT NULL,
      client_nom TEXT,
      client_email TEXT,
      client_whatsapp TEXT,
      contact_prefere TEXT,
      publie_par_soi INTEGER,
      mandat_signe_le TEXT,
      identite_verifiee_le TEXT,
      consentement_recherche_le TEXT,
      resume TEXT,
      prochaine_action TEXT,
      prochaine_echeance TEXT,
      resultat TEXT,
      clos_le TEXT,
      purger_apres TEXT,
      demande_id TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_dossiers_statut ON dossiers(statut, prochaine_echeance)`,
    `CREATE INDEX IF NOT EXISTS idx_dossiers_assigne ON dossiers(assigne_a, statut)`,
    `CREATE TABLE IF NOT EXISTS contenus (
      id TEXT PRIMARY KEY,
      dossier_id TEXT NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      domaine TEXT,
      plateforme TEXT,
      statut TEXT NOT NULL DEFAULT 'a-traiter',
      origine TEXT,
      ajoute_le TEXT NOT NULL,
      ajoute_par TEXT,
      ident_le TEXT,
      registrar TEXT,
      registrar_abuse TEXT,
      hebergeur TEXT,
      hebergeur_abuse TEXT,
      ips TEXT,
      derriere_cloudflare INTEGER,
      ident_json TEXT,
      verif_le TEXT,
      verif_http INTEGER,
      verif_alerte TEXT,
      retire_constate_le TEXT,
      note TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_contenus_dossier ON contenus(dossier_id)`,
    `CREATE INDEX IF NOT EXISTS idx_contenus_statut ON contenus(statut, verif_le)`,
    `CREATE TABLE IF NOT EXISTS etapes (
      id TEXT PRIMARY KEY,
      dossier_id TEXT NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
      contenu_id TEXT REFERENCES contenus(id) ON DELETE SET NULL,
      type TEXT NOT NULL,
      destinataire TEXT,
      statut TEXT NOT NULL DEFAULT 'a-faire',
      fait_le TEXT,
      echeance TEXT,
      reponse_le TEXT,
      courrier_id TEXT,
      relance_preparee INTEGER NOT NULL DEFAULT 0,
      note TEXT,
      cree_par TEXT,
      cree_le TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_etapes_dossier ON etapes(dossier_id)`,
    `CREATE INDEX IF NOT EXISTS idx_etapes_echeance ON etapes(statut, echeance)`,
    `CREATE TABLE IF NOT EXISTS courriers (
      id TEXT PRIMARY KEY,
      dossier_id TEXT NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
      contenu_id TEXT REFERENCES contenus(id) ON DELETE SET NULL,
      modele TEXT NOT NULL,
      langue TEXT NOT NULL,
      destinataire TEXT,
      destinataire_email TEXT,
      objet TEXT NOT NULL,
      corps TEXT NOT NULL,
      statut TEXT NOT NULL DEFAULT 'brouillon',
      automatique INTEGER NOT NULL DEFAULT 0,
      cree_par TEXT,
      cree_le TEXT NOT NULL,
      maj_le TEXT NOT NULL,
      valide_par TEXT,
      valide_le TEXT,
      envoye_par TEXT,
      envoye_le TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_courriers_dossier ON courriers(dossier_id)`,
    `CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      dossier_id TEXT NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
      auteur TEXT,
      texte TEXT NOT NULL,
      cree_le TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_notes_dossier ON notes(dossier_id)`,
    `CREATE TABLE IF NOT EXISTS journal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      le TEXT NOT NULL,
      utilisateur_id TEXT,
      action TEXT NOT NULL,
      objet TEXT,
      objet_id TEXT,
      dossier_id TEXT,
      details TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_journal_dossier ON journal(dossier_id, le)`,
    `CREATE INDEX IF NOT EXISTS idx_journal_le ON journal(le)`,
    `CREATE TABLE IF NOT EXISTS push_abonnements (
      endpoint TEXT PRIMARY KEY,
      utilisateur_id TEXT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
      appareil TEXT,
      cree_le TEXT NOT NULL,
      dernier_envoi_le TEXT,
      echecs INTEGER NOT NULL DEFAULT 0
    )`,
    `CREATE INDEX IF NOT EXISTS idx_push_user ON push_abonnements(utilisateur_id)`,
    `CREATE TABLE IF NOT EXISTS stats_vues (
      jour TEXT NOT NULL,
      chemin TEXT NOT NULL,
      source TEXT NOT NULL,
      pays TEXT NOT NULL,
      n INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (jour, chemin, source, pays)
    )`,
    `CREATE TABLE IF NOT EXISTS stats_evenements (
      jour TEXT NOT NULL,
      evenement TEXT NOT NULL,
      n INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (jour, evenement)
    )`,
    `CREATE TABLE IF NOT EXISTS liens_officiels (
      url TEXT PRIMARY KEY,
      verifie_le TEXT NOT NULL,
      http INTEGER,
      ok INTEGER NOT NULL,
      erreur TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS taches (
      nom TEXT PRIMARY KEY,
      derniere_execution TEXT NOT NULL,
      resultat TEXT
    )`,
    `INSERT OR IGNORE INTO parametres (cle, valeur) VALUES
      ('retention_dossier_jours', '180'),
      ('retention_demande_jours', '30'),
      ('session_inactivite_minutes', '180'),
      ('session_duree_heures', '24'),
      ('attribution', '{}')`,
  ],
  // 2 — temps passé par dossier (pour connaître la rentabilité réelle)
  [`ALTER TABLE dossiers ADD COLUMN temps_minutes INTEGER NOT NULL DEFAULT 0`],
  // 3 — client professionnel (commerce, entreprise) : tarif multiplié par deux
  [`ALTER TABLE dossiers ADD COLUMN client_pro INTEGER NOT NULL DEFAULT 0`],
  // 4 — rétractations reçues en ligne (« Renoncer au contrat ici »), obligatoire dans l'UE
  [
    `CREATE TABLE IF NOT EXISTS retractations (
      id TEXT PRIMARY KEY,
      ref TEXT NOT NULL UNIQUE,
      recue_le TEXT NOT NULL,
      langue TEXT NOT NULL,
      nom TEXT NOT NULL,
      dossier_ref TEXT,
      dossier_id TEXT,
      contact_mode TEXT NOT NULL,
      contact_valeur TEXT NOT NULL,
      message TEXT,
      ip_hash TEXT,
      accuse_le TEXT,
      accuse_par TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_retractations_dossier ON retractations (dossier_id)`,
    `CREATE INDEX IF NOT EXISTS idx_retractations_attente ON retractations (accuse_le, recue_le)`,
  ],
  // 5 — numéro WhatsApp de chaque membre : donné au client seulement à l'ouverture de son dossier
  [`ALTER TABLE utilisateurs ADD COLUMN whatsapp TEXT`],
  // 6 — signature électronique du devis et du mandat (lien personnel envoyé au client)
  [
    `CREATE TABLE IF NOT EXISTS signatures (
      id TEXT PRIMARY KEY,
      dossier_id TEXT NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
      jeton_hash TEXT NOT NULL UNIQUE,
      langue TEXT NOT NULL,
      document TEXT NOT NULL,
      document_hash TEXT NOT NULL,
      resume TEXT NOT NULL,
      representant TEXT NOT NULL,
      cree_le TEXT NOT NULL,
      cree_par TEXT,
      expire_le TEXT NOT NULL,
      annule_le TEXT,
      signe_le TEXT,
      nom_signe TEXT,
      debut_immediat INTEGER,
      document_signe TEXT,
      ip_hash TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_signatures_dossier ON signatures (dossier_id)`,
  ],
  // 7 — paiements en ligne (Paystack). Gardés pour la comptabilité même après
  // la purge du dossier : seule la référence du dossier reste, sans donnée personnelle.
  [
    `CREATE TABLE IF NOT EXISTS paiements (
      id TEXT PRIMARY KEY,
      dossier_id TEXT REFERENCES dossiers(id) ON DELETE SET NULL,
      type TEXT NOT NULL,
      reference TEXT NOT NULL UNIQUE,
      montant_eur REAL NOT NULL,
      devise TEXT NOT NULL,
      montant_devise INTEGER NOT NULL,
      taux REAL,
      lien TEXT,
      statut TEXT NOT NULL DEFAULT 'en-attente',
      cree_le TEXT NOT NULL,
      cree_par TEXT,
      paye_le TEXT,
      canal TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_paiements_dossier ON paiements (dossier_id)`,
  ],
  // 8 — paiements faits avec une clé de test Paystack (aucun vrai argent) :
  // marqués pour ne jamais être confondus avec un vrai paiement.
  [`ALTER TABLE paiements ADD COLUMN test INTEGER NOT NULL DEFAULT 0`],
  // 9 — robot Telegram officiel : les demandes peuvent arriver par Telegram, et
  // l'équipe répond dans la même conversation. SQLite ne sait pas modifier une
  // contrainte CHECK : la table des demandes est recréée à l'identique, avec
  // « telegram » en plus dans les moyens de contact (aucune donnée ne change).
  // ATTENTION pour l'avenir : depuis cette migration, « messages » et
  // « telegram_conversations » dépendent de « demandes ». Ne plus jamais recréer
  // la table des demandes de cette façon : DROP TABLE déclencherait les
  // suppressions en cascade et effacerait les messages des clients.
  [
    `CREATE TABLE demandes_v9 (
      id TEXT PRIMARY KEY,
      ref TEXT NOT NULL UNIQUE,
      recue_le TEXT NOT NULL,
      langue TEXT NOT NULL,
      pays TEXT,
      situation TEXT NOT NULL,
      plateformes TEXT,
      liens TEXT,
      message TEXT,
      pseudo TEXT NOT NULL,
      contact_mode TEXT NOT NULL CHECK (contact_mode IN ('email','whatsapp','telegram')),
      contact_valeur TEXT NOT NULL,
      menace INTEGER NOT NULL DEFAULT 0,
      deja_signale INTEGER NOT NULL DEFAULT 0,
      publie_par_soi INTEGER,
      consentement_version TEXT NOT NULL,
      consentement_le TEXT NOT NULL,
      statut TEXT NOT NULL DEFAULT 'nouvelle',
      assigne_a TEXT REFERENCES utilisateurs(id) ON DELETE SET NULL,
      traitee_par TEXT REFERENCES utilisateurs(id) ON DELETE SET NULL,
      traitee_le TEXT,
      note_traitement TEXT,
      dossier_id TEXT,
      ip_hash TEXT
    )`,
    `INSERT INTO demandes_v9 (${COLONNES_DEMANDES}) SELECT ${COPIE_DEMANDES} FROM demandes`,
    `DROP TABLE demandes`,
    `ALTER TABLE demandes_v9 RENAME TO demandes`,
    `CREATE INDEX IF NOT EXISTS idx_demandes_statut ON demandes(statut, recue_le)`,
    `CREATE INDEX IF NOT EXISTS idx_demandes_ip ON demandes(ip_hash, recue_le)`,
    // Identifiant de la conversation Telegram du client (jamais un numéro de téléphone).
    `ALTER TABLE dossiers ADD COLUMN client_telegram TEXT`,
    // Où en est chaque personne qui écrit au robot (questions, accord, demande).
    `CREATE TABLE IF NOT EXISTS telegram_conversations (
      chat_id TEXT PRIMARY KEY,
      langue TEXT NOT NULL DEFAULT 'fr',
      etape TEXT NOT NULL,
      situation TEXT,
      menace INTEGER,
      texte_attente TEXT,
      demande_id TEXT REFERENCES demandes(id) ON DELETE SET NULL,
      bloque INTEGER NOT NULL DEFAULT 0,
      accuse_le TEXT,
      notifie_le TEXT,
      cree_le TEXT NOT NULL,
      maj_le TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_tg_conversations_demande ON telegram_conversations (demande_id)`,
    // Messages écrits échangés avec le client (jamais d'image), effacés avec la demande.
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      demande_id TEXT NOT NULL REFERENCES demandes(id) ON DELETE CASCADE,
      canal TEXT NOT NULL DEFAULT 'telegram',
      sens TEXT NOT NULL CHECK (sens IN ('entrant','sortant')),
      texte TEXT NOT NULL,
      le TEXT NOT NULL,
      auteur TEXT REFERENCES utilisateurs(id) ON DELETE SET NULL,
      lu_le TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_messages_demande ON messages (demande_id, le)`,
    `CREATE INDEX IF NOT EXISTS idx_messages_non_lus ON messages (sens, lu_le)`,
    // Numéros des envois de Telegram déjà traités (un envoi répété n'est traité qu'une fois).
    `CREATE TABLE IF NOT EXISTS telegram_envois (update_id INTEGER PRIMARY KEY, le TEXT NOT NULL)`,
  ],
];

export const VERSION_SCHEMA = MIGRATIONS.length;

let pret: Promise<void> | null = null;

/** Met la base à jour si besoin (une seule fois par instance du moteur). */
export function ensureSchema(db: D1Database): Promise<void> {
  if (!pret) {
    pret = appliquer(db).catch((e) => {
      pret = null;
      throw e;
    });
  }
  return pret;
}

async function appliquer(db: D1Database): Promise<void> {
  await db.prepare('CREATE TABLE IF NOT EXISTS schema_version (id INTEGER PRIMARY KEY CHECK (id = 1), version INTEGER NOT NULL)').run();
  const row = await db.prepare('SELECT version FROM schema_version WHERE id = 1').first<{ version: number }>();
  let version = row?.version ?? 0;
  while (version < VERSION_SCHEMA) {
    const stmts = MIGRATIONS[version].map((sql) => db.prepare(sql));
    stmts.push(
      db
        .prepare('INSERT INTO schema_version (id, version) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET version = excluded.version')
        .bind(version + 1),
    );
    await db.batch(stmts);
    version++;
  }
}
