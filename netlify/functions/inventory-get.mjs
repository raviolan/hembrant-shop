import { HEADERS, normalizeMap, loadMap, saveMap } from './_util.mjs';

export default async function handler() {
  const ctx = await loadMap();
  let map = ctx.map;

  if (Object.keys(map).length === 0 && process.env.INVENTORY_DATA) {
    try { map = JSON.parse(process.env.INVENTORY_DATA); await saveMap(ctx, map); } catch { }
  }

  return {
    statusCode: 200,
    headers: { ...HEADERS, 'X-Inventory-Storage': ctx.kind }, // should be 'blobs'
    body: JSON.stringify(normalizeMap(map)),
  };
}
