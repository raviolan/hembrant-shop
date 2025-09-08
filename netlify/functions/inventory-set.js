const { getStore } = require('@netlify/blobs');

const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

const coerceStock = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : null; // null => infinite
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'method not allowed' }) };
  }

  const token = event.headers['x-admin-token'];
  const expected = process.env.ADMIN_TOKEN;             // env ONLY (no hard-coded fallback)
  if (!expected || token !== expected) {
    return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'unauthorized' }) };
  }

  let body; try { body = JSON.parse(event.body || '{}'); } catch { body = {}; }
  const id = String(body.id || '').trim();
  if (!id) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'missing id' }) };

  const store = getStore('inventory');                  // <— also inside a function
  const raw = await store.get('inventory.json');
  const map = raw ? JSON.parse(raw) : {};

  const rec = map[id] || { stock: null, outOfStock: false };
  if (Object.prototype.hasOwnProperty.call(body, 'stock')) {
    const n = coerceStock(body.stock);
    rec.stock = n;
    rec.outOfStock = n === 0 ? true : !!rec.outOfStock;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'outOfStock')) {
    rec.outOfStock = !!body.outOfStock;
  }

  map[id] = rec;
  await store.set('inventory.json', JSON.stringify(map));

  return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ id, ...rec }) };
};

const { HEADERS, coerceStock, loadMap, saveMap } = require('./_util');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'method not allowed' }) };
  }

  const token = event.headers['x-admin-token'];
  const expected = process.env.ADMIN_TOKEN; // env only
  if (!expected || token !== expected) {
    return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'unauthorized' }) };
  }

  let body; try { body = JSON.parse(event.body || '{}'); } catch { body = {}; }
  const id = String(body.id || '').trim();
  if (!id) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'missing id' }) };

  const ctx = await loadMap();
  const map = ctx.map;
  const current = map[id] || { stock: null, outOfStock: false };

  if (Object.prototype.hasOwnProperty.call(body, 'stock')) {
    const n = coerceStock(body.stock);
    current.stock = n;
    current.outOfStock = n === 0 ? true : !!current.outOfStock;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'outOfStock')) {
    current.outOfStock = !!body.outOfStock;
  }

  map[id] = current;
  await saveMap(ctx, map);
  return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ id, ...current }) };
};