const { HEADERS, normalizeMap, loadStore } = require('./_util');

exports.handler = async () => {
  const store = await loadStore();
  const raw = await store.get('inventory.json');
  let map = raw ? JSON.parse(raw) : {};

  // One-time seed from env if store empty
  if (!raw && process.env.INVENTORY_DATA) {
    try {
      map = JSON.parse(process.env.INVENTORY_DATA);
      await store.set('inventory.json', JSON.stringify(map));
    } catch (_) { /* ignore bad JSON */ }
  }

  return { statusCode: 200, headers: HEADERS, body: JSON.stringify(normalizeMap(map)) };
};