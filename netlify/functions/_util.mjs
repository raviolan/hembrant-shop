// ESM helpers for v2 Functions
import { getStore } from '@netlify/blobs';

export const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

export const coerceStock = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : null; // null = infinite
};

export const normalizeMap = (map) => {
  const out = {};
  for (const [id, rec] of Object.entries(map || {})) {
    const n = coerceStock(rec?.stock);
    out[id] = { stock: n, outOfStock: !!rec?.outOfStock };
  }
  return out;
};

// Must obtain store INSIDE the request lifecycle (v2)
async function obtainStore() {
  // Try auto-injected creds first (v2)
  try {
    return getStore('inventory');
  } catch {
    // Manual creds fallback
    const siteID =
      process.env.NETLIFY_BLOBS_SITE_ID ||
      process.env.SITE_ID ||
      process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_BLOBS_TOKEN;
    if (siteID && token) return getStore('inventory', { siteID, token });
    throw new Error('BlobsNotConfigured');
  }
}

export async function loadMap() {
  const store = await obtainStore();
  const raw = await store.get('inventory.json');
  const map = raw ? JSON.parse(raw) : {};
  return { kind: 'blobs', store, map };
}

export async function saveMap(ctx, map) {
  await ctx.store.set('inventory.json', JSON.stringify(map));
}
