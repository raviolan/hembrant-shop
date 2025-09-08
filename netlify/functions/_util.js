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

const loadMap = async () => {
  if (typeof getStore !== 'function') {
    // Fail loudly so dev fixes bundling instead of silently using RAM.
    throw new Error('@netlify/blobs not available; check netlify.toml and dependencies.');
  }
  const store = getStore('inventory'); // creds injected automatically in Functions
  const raw = await store.get('inventory.json');
  const map = raw ? JSON.parse(raw) : {};
  return { kind: 'blobs', store, map };
};

const saveMap = async (ctx, map) => {
  await ctx.store.set('inventory.json', JSON.stringify(map));
};

module.exports = { HEADERS, coerceStock, normalizeMap, loadMap, saveMap };