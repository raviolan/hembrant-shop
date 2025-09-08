import { HEADERS, coerceStock, loadMap, saveMap } from './_util.mjs';

export default async function handler(request, context) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method not allowed' }), { status: 405, headers: HEADERS });
  }

  let body = {};
  try { body = await request.json(); } catch { }
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) {
    return new Response(JSON.stringify({ error: 'no items' }), { status: 400, headers: HEADERS });
  }

  const ctx = await loadMap();
  const map = ctx.map;

  // validate
  const failures = [];
  for (const { id, qty } of items) {
    const rec = map[id] || { stock: null, outOfStock: false };
    const n = coerceStock(rec.stock);
    const finite = n !== null;
    if (rec.outOfStock) failures.push({ id, reason: 'outOfStock', stock: n ?? Infinity });
    else if (finite && n < qty) failures.push({ id, reason: 'insufficient', stock: n });
  }
  if (failures.length) {
    return new Response(JSON.stringify({ ok: false, failures }), { status: 409, headers: HEADERS });
  }

  // decrement
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
  return new Response(
    JSON.stringify({ ok: true, inventory: changed }),
    { status: 200, headers: { ...HEADERS, 'X-Inventory-Storage': ctx.kind } }
  );
}
