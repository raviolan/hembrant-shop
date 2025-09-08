// POST /api/inventory/set - DM/admin only endpoint to update stock
// Requires x-admin-token header matching ADMIN_TOKEN env var
// Body: { id: string, stock?: number, outOfStock?: boolean }
const { getInventoryStore } = require('./_blob.js');

exports.handler = async (event) => {
  const HEADERS = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'method not allowed' }) };
  }

  const token = event.headers['x-admin-token'];
  const expected = process.env.ADMIN_TOKEN || process.env.very_secret_token_0215;
  if (!expected || token !== expected) {
    return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'unauthorized' }) };
  }

  try {
    console.log('inventory-set: Starting request, body:', event.body);
    const { id, stock, outOfStock } = JSON.parse(event.body);
    console.log('inventory-set: Parsed request - id:', id, 'stock:', stock, 'outOfStock:', outOfStock);
    
    if (!id) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'missing id' })
      };
    }

    console.log('inventory-set: Getting store...');
    const store = await getInventoryStore();
    console.log('inventory-set: Got store, getting data...');
    const raw = await store.get('inventory.json');
    console.log('inventory-set: Got raw data:', raw ? 'data present' : 'no data');
    const map = raw ? JSON.parse(raw) : {};
    console.log('inventory-set: Current inventory has', Object.keys(map).length, 'items');
    
    // Get current record or create default
    const current = map[id] ?? { stock: Infinity, outOfStock: false };
    
    // Update only provided fields
    map[id] = {
      stock: Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : current.stock,
      outOfStock: typeof outOfStock === 'boolean' ? outOfStock : current.outOfStock
    };
    
    // Save updated map
    await store.set('inventory.json', JSON.stringify(map));
    
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(map[id])
    };
    
  } catch (error) {
    console.error('Inventory set error:', error);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Failed to update inventory' })
    };
  }
};