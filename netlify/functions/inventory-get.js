const { HEADERS, normalizeMap, loadMap, saveMap } = require('./_util');
const { getStore } = require('@netlify/blobs');

const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

exports.handler = async () => {
  const store = getStore('inventory');                  // <— THIS is “inside a function”
  const raw = await store.get('inventory.json');        // string | null
  let map = raw ? JSON.parse(raw) : {};

  // one-time seed from env if empty
  if (!raw && process.env.INVENTORY_DATA) {
    try {
      map = JSON.parse(process.env.INVENTORY_DATA);
      await store.set('inventory.json', JSON.stringify(map));
    } catch (_) { }
  }

  // normalize types (stock as number or null)
  const out = {};
  for (const [id, rec] of Object.entries(map)) {
    const n = Number(rec?.stock);
    out[id] = { stock: Number.isFinite(n) ? Math.max(0, Math.floor(n)) : null, outOfStock: !!rec?.outOfStock };
  }

  return { statusCode: 200, headers: HEADERS, body: JSON.stringify(out) };
};

exports.handler = async () => {
  const ctx = await loadMap();
  let map = ctx.map;

  // One-time seed from env if empty
  if (Object.keys(map).length === 0 && process.env.INVENTORY_DATA) {
    try { map = JSON.parse(process.env.INVENTORY_DATA); await saveMap(ctx, map); } catch { }
  }

  return { statusCode: 200, headers: HEADERS, body: JSON.stringify(normalizeMap(map)) };
};