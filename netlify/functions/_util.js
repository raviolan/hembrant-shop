// netlify/functions/_util.js
let getStore;
try { ({ getStore } = require('@netlify/blobs')); } catch { getStore = null; }

const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

const coerceStock = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : null; // null = infinite
};

const normalizeMap = (map) => {
  const out = {};
  for (const [id, rec] of Object.entries(map || {})) {
    const n = coerceStock(rec?.stock);
    out[id] = { stock: n, outOfStock: !!rec?.outOfStock };
  }
  return out;
};

async function obtainStore() {
  if (typeof getStore !== 'function') return null;
  // Try auto (Netlify-injected) first
  try {
    return getStore('inventory');
  } catch (_) {
    // Fallback: explicit credentials from env
    const siteID =
      process.env.NETLIFY_BLOBS_SITE_ID ||
      process.env.SITE_ID ||
      process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_BLOBS_TOKEN;
    if (siteID && token) return getStore('inventory', { siteID, token });
    return null;
  }
}

const loadMap = async () => {
  const store = await obtainStore();
  if (store) {
    const raw = await store.get('inventory.json');
    const map = raw ? JSON.parse(raw) : {};
    return { kind: 'blobs', store, map };
  }
  // Memory/env fallback (not durable) so your shop still works while you wire creds
  globalThis.__inv = globalThis.__inv || (() => {
    try { return JSON.parse(process.env.INVENTORY_DATA || '{}'); } catch { return {}; }
  })();
  return { kind: 'memory', store: null, map: globalThis.__inv };
};

const saveMap = async (ctx, map) => {
  if (ctx.kind === 'blobs') {
    await ctx.store.set('inventory.json', JSON.stringify(map));
  } else {
    globalThis.__inv = map;
  }
};

module.exports = { HEADERS, coerceStock, normalizeMap, loadMap, saveMap };
