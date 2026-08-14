import { publicApi, type PublicPortal } from '@/lib/api';

const key = 'shikshavritti.public-portal.v2'; const ttl = 60_000;
let memory: { data: PublicPortal; storedAt: number } | null = null;
let request: Promise<PublicPortal | null> | null = null;

function readSession() {
  if (typeof window === 'undefined') return null;
  try { const cached = JSON.parse(sessionStorage.getItem(key) ?? 'null');
    return cached?.data && Date.now() - cached.storedAt < ttl ? cached as typeof memory : null; }
  catch { return null; }
}

export function getCachedPublicPortal() { const cached = memory ?? readSession(); if (cached) memory = cached; return cached?.data ?? null; }

export function invalidatePublicPortalCache() {
  memory = null; request = null;
  if (typeof window !== 'undefined') sessionStorage.removeItem(key);
}

export function loadPublicPortal() {
  const cached = getCachedPublicPortal(); if (cached) return Promise.resolve(cached);
  if (request) return request;
  request = publicApi.getPortal().then((response) => {
    const entry = { data: response.data, storedAt: Date.now() }; memory = entry;
    if (typeof window !== 'undefined') sessionStorage.setItem(key, JSON.stringify(entry)); return entry.data;
  }).catch(() => null).finally(() => { request = null; });
  return request;
}
