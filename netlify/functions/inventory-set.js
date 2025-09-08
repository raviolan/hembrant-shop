const { HEADERS, coerceStock, loadMap, saveMap } = require('./_util');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'method not allowed' }) };
  }

  // Auth: env-only (no hard-coded fallbacks; avoids secrets-scan issues)
  const token = event.headers['x-admin-token'];
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || token !== expected) {
    return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'unauthorized' }) };
  }

  // Parse body
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { body = {}; }

  const id = String(body.id || '').trim();
  if (!id) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'missing id' }) };
  }

  // Load current map
  const ctx = await loadMap();
  const map = ctx.map;

  // Update record
  const current = map[id] || { stock: null, outOfStock: false };

  if (Object.prototype.hasOwnProperty.call(body, 'stock')) {
    const n = coerceStock(body.stock);
    current.stock = n;                          // number or null (null = infinite)
    current.outOfStock = n === 0 ? true : !!current.outOfStock;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'outOfStock')) {
    current.outOfStock = !!body.outOfStock;
  }

  map[id] = current;
  await saveMap(ctx, map);

  return {
    statusCode: 200,
    headers: HEADERS,
    body: JSON.stringify({ id, ...current }),
  };
};
