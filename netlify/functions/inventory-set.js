// POST /api/inventory/set - DM/admin only endpoint to update stock
// Requires x-admin-token header matching ADMIN_TOKEN env var
// Body: { id: string, stock?: number, outOfStock?: boolean }
const { getInventoryStore, HEADERS } = require('./_blob.js');

exports.handler = async (event, context) => {
  try {
    // Verify admin token
    const token = event.headers['x-admin-token'];
    if (!token || token !== process.env.ADMIN_TOKEN) {
      return {
        statusCode: 401,
        headers: HEADERS,
        body: JSON.stringify({ error: 'unauthorized' })
      };
    }
    
    const { id, stock, outOfStock } = JSON.parse(event.body);
    if (!id) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'missing id' })
      };
    }

    const store = await getInventoryStore();
    const raw = await store.get('inventory.json');
    const map = raw ? JSON.parse(raw) : {};
    
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