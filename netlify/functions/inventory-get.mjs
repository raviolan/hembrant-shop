import { HEADERS, normalizeMap, loadMap, saveMap } from './_util.mjs';

export default async function handler(request, context) {
  const ctx = await loadMap();
  let map = ctx.map;

  // optional seed from env on first run
  if (Object.keys(map).length === 0 && process.env.INVENTORY_DATA) {
    try { map = JSON.parse(process.env.INVENTORY_DATA); await saveMap(ctx, map); } catch { }
  }

  return new Response(
    JSON.stringify(normalizeMap(map)),
    { status: 200, headers: { ...HEADERS, 'X-Inventory-Storage': ctx.kind } }
  );
}
