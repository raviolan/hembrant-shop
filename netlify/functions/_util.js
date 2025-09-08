const { getStore } = require('@netlify/blobs');

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

exports.loadStore = async () => getStore('inventory');