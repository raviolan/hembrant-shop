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
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || token !== expected) {
    return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'unauthorized' }) };
  }

  try {
    console.log('inventory-set: Starting request, body:', event.body);
    const requestData = JSON.parse(event.body);
    const { id, stock, outOfStock } = requestData;
    console.log('inventory-set: Parsed request - id:', id, 'stock:', stock, 'typeof stock:', typeof stock, 'outOfStock:', outOfStock);
    
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
    console.log('inventory-set: Current map before update:', map);
    
    // Handle stock value conversion
    let finalStock;
    if (stock === undefined || stock === null) {
      finalStock = Infinity; // Default to unlimited
    } else if (stock === '') {
      finalStock = Infinity; // Empty string = unlimited
    } else {
      const numStock = Number(stock);
      if (Number.isFinite(numStock) && numStock >= 0) {
        finalStock = Math.floor(numStock);
      } else {
        finalStock = Infinity;
      }
    }
    
    // Create/update the record
    map[id] = {
      stock: finalStock,
      outOfStock: !!outOfStock
    };
    
    console.log('inventory-set: Final record for', id, ':', map[id]);
    
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