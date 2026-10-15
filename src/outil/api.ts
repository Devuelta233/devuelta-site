// Accès à l'API de l'outil. L'en-tête X-Devuelta-Outil protège contre les
// requêtes forgées depuis un autre site ; le cookie de session est HttpOnly.

export class ErreurApi extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}

let surDeconnexion: (() => void) | null = null;
export function quandDeconnecte(f: () => void): void {
  surDeconnexion = f;
}

export async function api<T = Record<string, unknown>>(chemin: string, options: { method?: string; corps?: unknown } = {}): Promise<T> {
  const method = options.method ?? (options.corps === undefined ? 'GET' : 'POST');
  const r = await fetch(`/api/outil${chemin}`, {
    method,
    credentials: 'same-origin',
    headers: {
      'X-Devuelta-Outil': '1',
      ...(options.corps !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.corps !== undefined ? JSON.stringify(options.corps) : undefined,
  });
  let j: Record<string, unknown> = {};
  try {
    j = await r.json();
  } catch {
    j = {};
  }
  if (!r.ok || j.ok === false) {
    const code = String(j.erreur ?? `http-${r.status}`);
    if ((r.status === 401 && code === 'non-connecte') || code === 'connexion-incomplete') surDeconnexion?.();
    throw new ErreurApi(r.status, code);
  }
  return j as T;
}

export const get = <T = Record<string, unknown>>(c: string) => api<T>(c);
export const post = <T = Record<string, unknown>>(c: string, corps: unknown = {}) => api<T>(c, { method: 'POST', corps });
export const patch = <T = Record<string, unknown>>(c: string, corps: unknown) => api<T>(c, { method: 'PATCH', corps });
export const put = <T = Record<string, unknown>>(c: string, corps: unknown) => api<T>(c, { method: 'PUT', corps });
export const del = <T = Record<string, unknown>>(c: string) => api<T>(c, { method: 'DELETE' });
