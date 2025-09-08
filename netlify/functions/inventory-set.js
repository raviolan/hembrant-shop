const { HEADERS, coerceStock, loadStore } = require('./_util');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'method not allowed' }) };
  }

  const token = event.headers['x-admin-token'];
  const expected = process.env.ADMIN_TOKEN || process.env.very_secret_token_0215;
  if (!expected || token !== expected) {
    return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'unauthorized' }) };
  }

  let body; try { body = JSON.parse(event.body || '{}'); } catch { body = {}; }
  const id = String(body.id || '').trim();
  if (!id) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'missing id' }) };

  const store = await loadStore();
  const raw = await store.get('inventory.json');
  const map = raw ? JSON.parse(raw) : {};

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
  await store.set('inventory.json', JSON.stringify(map));
  return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ id, ...current }) };
};