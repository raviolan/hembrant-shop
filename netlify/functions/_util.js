let blobs;
try { blobs = require('@netlify/blobs'); } catch { blobs = null; }

exports.HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

exports.coerceStock = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : null; // null = infinite
};

exports.normalizeMap = (map) => {
  const out = {};
  for (const [id, rec] of Object.entries(map || {})) {
    const stock = exports.coerceStock(rec?.stock);
    out[id] = { stock, outOfStock: !!rec?.outOfStock };
  }
  return out;
};

exports.loadMap = async () => {
  // Prefer Blobs if available
  if (blobs?.getStore) {
    try {
      const store = blobs.getStore('inventory');
      const raw = await store.get('inventory.json');
      return { kind: 'blobs', store, map: raw ? JSON.parse(raw) : {} };
    } catch (error) {
      // Fall through to memory storage if Blobs fails
    }
  }
  // Fallback to in-memory seeded from env
  globalThis.__inv = globalThis.__inv || (() => {
    try { return JSON.parse(process.env.INVENTORY_DATA || '{}'); } catch { return {}; }
  })();
  return { kind: 'memory', store: null, map: globalThis.__inv };
};

exports.saveMap = async (ctx, map) => {
  if (ctx.kind === 'blobs') {
    await ctx.store.set('inventory.json', JSON.stringify(map));
  } else {
    globalThis.__inv = map;
  }
};