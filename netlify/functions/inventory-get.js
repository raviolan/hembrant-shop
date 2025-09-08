const { HEADERS, normalizeMap, loadMap, saveMap } = require('./_util');

exports.handler = async () => {
  const ctx = await loadMap();
  let map = ctx.map;

  // One-time seed from env if empty
  if (Object.keys(map).length === 0 && process.env.INVENTORY_DATA) {
    try { map = JSON.parse(process.env.INVENTORY_DATA); await saveMap(ctx, map); } catch {}
  }

  return { statusCode: 200, headers: HEADERS, body: JSON.stringify(normalizeMap(map)) };
};