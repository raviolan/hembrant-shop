const { HEADERS, coerceStock, loadMap, saveMap } = require('./_util');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'method not allowed' }) };
  }
  let body; try { body = JSON.parse(event.body || '{}'); } catch { body = {}; }
  const items = Array.isArray(body.items) ? body.items : [];

  const ctx = await loadMap();
  const map = ctx.map;

  const failures = [];
  for (const { id, qty } of items) {
    const rec = map[id] || { stock: null, outOfStock: false };
    const n = coerceStock(rec.stock);
    const finite = n !== null;
    if (rec.outOfStock) failures.push({ id, reason: 'outOfStock', stock: n ?? Infinity });
    else if (finite && n < qty) failures.push({ id, reason: 'insufficient', stock: n });
  }
  if (failures.length) {
    return { statusCode: 409, headers: HEADERS, body: JSON.stringify({ ok: false, failures }) };
  }

  for (const { id, qty } of items) {
    const rec = map[id] || { stock: null, outOfStock: false };
    const n = coerceStock(rec.stock);
    if (n !== null) {
      rec.stock = Math.max(0, n - qty);
      rec.outOfStock = rec.stock === 0 ? true : !!rec.outOfStock;
      map[id] = rec;
    }
  }

  await saveMap(ctx, map);
  const changed = Object.fromEntries(items.map(({ id }) => [id, map[id] || { stock: null, outOfStock: false }]));
  return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true, inventory: changed }) };
};