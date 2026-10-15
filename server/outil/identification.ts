// Identification technique d'un lien : à qui écrire ?
// Plateforme connue → son formulaire officiel. Sinon : registrar du nom de
// domaine et hébergeur de l'adresse IP, avec leurs contacts « abuse » (RDAP).
// Uniquement des données publiques, aucune intrusion.

const PLATEFORMES: Array<[RegExp, string]> = [
  [/(^|\.)(facebook\.com|fb\.com|fb\.watch|messenger\.com)$/, 'facebook'],
  [/(^|\.)(instagram\.com|instagr\.am)$/, 'instagram'],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, 'whatsapp'],
  [/(^|\.)(tiktok\.com)$/, 'tiktok'],
  [/(^|\.)(x\.com|twitter\.com|t\.co)$/, 'x'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'youtube'],
  [/(^|\.)(snapchat\.com)$/, 'snapchat'],
  [/(^|\.)(t\.me|telegram\.org|telegram\.me)$/, 'telegram'],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, 'linkedin'],
  [/(^|\.)(reddit\.com|redd\.it)$/, 'reddit'],
  [/(^|\.)(discord\.com|discord\.gg|discordapp\.com)$/, 'discord'],
  [/(^|\.)(onlyfans\.com)$/, 'onlyfans'],
  [/(^|\.)(pornhub\.com)$/, 'pornhub'],
  [/(^|\.)(maps\.google\.[a-z.]+|maps\.app\.goo\.gl|g\.page)$/, 'google-maps'],
  [/(^|\.)(google\.[a-z.]+)$/, 'google'],
  [/(^|\.)(bing\.com)$/, 'bing'],
  [/(^|\.)(trustpilot\.com)$/, 'trustpilot'],
];

// Suffixes à deux niveaux les plus courants sur nos marchés.
const SUFFIXES_2 = new Set([
  'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'me.uk', 'com.au', 'net.au', 'org.au', 'co.nz', 'com.mx', 'org.mx', 'gob.mx',
  'net.mx', 'com.ar', 'org.ar', 'gob.ar', 'net.ar', 'com.co', 'org.co', 'gov.co', 'net.co', 'com.br', 'net.br', 'org.br',
  'co.za', 'com.gh', 'org.gh', 'gov.gh', 'edu.gh', 'co.ci', 'com.es', 'org.es', 'nom.es', 'com.pe', 'com.ve', 'com.ec',
  'com.uy', 'com.py', 'com.bo', 'com.gt', 'com.do', 'co.jp', 'ne.jp', 'com.tr', 'com.cn', 'com.sg', 'co.in', 'co.il',
  'com.ng', 'co.ke', 'com.pa', 'com.sv', 'com.hn', 'com.ni', 'co.cr', 'com.cu', 'gouv.fr', 'asso.fr', 'com.fr',
]);

export function hoteDe(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
  } catch {
    return null;
  }
}

export function domaineEnregistrable(host: string): string {
  const parts = host.split('.');
  if (parts.length <= 2) return host;
  const last2 = parts.slice(-2).join('.');
  if (SUFFIXES_2.has(last2)) return parts.slice(-3).join('.');
  return last2;
}

export function plateformeConnue(host: string): string | null {
  for (const [re, id] of PLATEFORMES) if (re.test(host)) return id;
  return null;
}

interface VCardEntity {
  roles?: string[];
  vcardArray?: [string, Array<[string, Record<string, unknown>, string, unknown]>];
  entities?: VCardEntity[];
  publicIds?: Array<{ type: string; identifier: string }>;
}

function vcardField(e: VCardEntity, field: string): string | null {
  for (const it of e.vcardArray?.[1] ?? []) {
    if (it[0] !== field) continue;
    const v = it[3];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (Array.isArray(v)) {
      const s = v.filter((x) => typeof x === 'string' && x).join(' ');
      if (s.trim()) return s.trim();
    }
  }
  return null;
}

function findRole(entities: VCardEntity[] | undefined, role: string): VCardEntity | null {
  for (const e of entities ?? []) {
    if (e.roles?.includes(role)) return e;
    const nested = findRole(e.entities, role);
    if (nested) return nested;
  }
  return null;
}

function emailPropre(v: string | null): string | null {
  if (!v) return null;
  const s = v.replace(/^mailto:/i, '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : null;
}

async function fetchJson(url: string, timeoutMs = 8000): Promise<unknown | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      headers: { Accept: 'application/rdap+json, application/dns-json, application/json' },
      signal: ctrl.signal,
      redirect: 'follow',
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export interface Identification {
  hote: string;
  domaine: string;
  plateforme: string | null;
  registrar: string | null;
  registrar_iana: string | null;
  registrar_abuse: string | null;
  registrar_abuse_tel: string | null;
  domaine_cree_le: string | null;
  domaine_expire_le: string | null;
  serveurs_dns: string[];
  ips: string[];
  hebergeur: string | null;
  hebergeur_abuse: string | null;
  reseau: string | null;
  pays_reseau: string | null;
  derriere_cloudflare: boolean;
  erreurs: string[];
  le: string;
}

export async function identifier(url: string): Promise<Identification> {
  const hote = hoteDe(url);
  if (!hote) throw new Error('lien-invalide');
  const domaine = domaineEnregistrable(hote);
  const res: Identification = {
    hote,
    domaine,
    plateforme: plateformeConnue(hote),
    registrar: null,
    registrar_iana: null,
    registrar_abuse: null,
    registrar_abuse_tel: null,
    domaine_cree_le: null,
    domaine_expire_le: null,
    serveurs_dns: [],
    ips: [],
    hebergeur: null,
    hebergeur_abuse: null,
    reseau: null,
    pays_reseau: null,
    derriere_cloudflare: false,
    erreurs: [],
    le: new Date().toISOString(),
  };

  const [rdapDomaine, dnsA, dnsAAAA] = await Promise.all([
    fetchJson(`https://rdap.org/domain/${encodeURIComponent(domaine)}`),
    fetchJson(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hote)}&type=A`),
    fetchJson(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hote)}&type=AAAA`),
  ]);

  if (rdapDomaine && typeof rdapDomaine === 'object') {
    const d = rdapDomaine as {
      entities?: VCardEntity[];
      events?: Array<{ eventAction: string; eventDate: string }>;
      nameservers?: Array<{ ldhName?: string }>;
    };
    const registrar = findRole(d.entities, 'registrar');
    if (registrar) {
      res.registrar = vcardField(registrar, 'fn');
      res.registrar_iana = registrar.publicIds?.find((p) => /iana/i.test(p.type))?.identifier ?? null;
      const abuse = findRole(registrar.entities, 'abuse');
      if (abuse) {
        res.registrar_abuse = emailPropre(vcardField(abuse, 'email'));
        res.registrar_abuse_tel = vcardField(abuse, 'tel')?.replace(/^tel:/i, '') ?? null;
      }
    }
    if (!res.registrar_abuse) {
      const abuse = findRole(d.entities, 'abuse');
      if (abuse) res.registrar_abuse = emailPropre(vcardField(abuse, 'email'));
    }
    for (const ev of d.events ?? []) {
      if (ev.eventAction === 'registration') res.domaine_cree_le = ev.eventDate;
      if (ev.eventAction === 'expiration') res.domaine_expire_le = ev.eventDate;
    }
    res.serveurs_dns = (d.nameservers ?? []).map((n) => (n.ldhName ?? '').toLowerCase()).filter(Boolean).slice(0, 6);
  } else {
    res.erreurs.push('rdap-domaine-indisponible');
  }

  const answers = (x: unknown, type: number) =>
    ((x as { Answer?: Array<{ type: number; data: string }> } | null)?.Answer ?? []).filter((a) => a.type === type).map((a) => a.data);
  res.ips = [...answers(dnsA, 1), ...answers(dnsAAAA, 28)].slice(0, 6);
  if (res.ips.length === 0) res.erreurs.push('aucune-adresse-ip');

  if (res.ips[0]) {
    const rdapIp = (await fetchJson(`https://rdap.org/ip/${encodeURIComponent(res.ips[0])}`)) as
      | { name?: string; country?: string; entities?: VCardEntity[] }
      | null;
    if (rdapIp) {
      res.reseau = rdapIp.name ?? null;
      res.pays_reseau = typeof rdapIp.country === 'string' ? rdapIp.country.toUpperCase().slice(0, 2) : null;
      const org = findRole(rdapIp.entities, 'registrant') ?? findRole(rdapIp.entities, 'administrative');
      res.hebergeur = (org && vcardField(org, 'fn')) || rdapIp.name || null;
      const abuse = findRole(rdapIp.entities, 'abuse');
      if (abuse) res.hebergeur_abuse = emailPropre(vcardField(abuse, 'email'));
      res.derriere_cloudflare = `${res.hebergeur ?? ''} ${res.reseau ?? ''}`.toLowerCase().includes('cloudflare');
    } else {
      res.erreurs.push('rdap-ip-indisponible');
    }
  }
  return res;
}
