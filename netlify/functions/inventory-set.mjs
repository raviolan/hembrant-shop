import { HEADERS, coerceStock, loadMap, saveMap } from './_util.mjs';

export default async function handler(request, context) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method not allowed' }), { status: 405, headers: HEADERS });
  }

  const token = request.headers.get('x-admin-token');
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || token !== expected) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: HEADERS });
  }

  let body = {};
  try { body = await request.json(); } catch { }

  const id = String(body.id || '').trim();
  if (!id) {
    return new Response(JSON.stringify({ error: 'missing id' }), { status: 400, headers: HEADERS });
  }

  const ctx = await loadMap();
  const map = ctx.map;

  const current = map[id] || { stock: null, outOfStock: false };
  if (Object.prototype.hasOwnProperty.call(body, 'stock')) {
    const n = coerceStock(body.stock);
    current.stock = n; // number or null (infinite)
    current.outOfStock = n === 0 ? true : !!current.outOfStock;
  }
  if (Object.prototype.hasOwnProperty.call(body, 'outOfStock')) {
    current.outOfStock = !!body.outOfStock;
  }

  map[id] = current;
  await saveMap(ctx, map);

  return new Response(
    JSON.stringify({ id, ...current }),
    { status: 200, headers: { ...HEADERS, 'X-Inventory-Storage': ctx.kind } }
  );
}
