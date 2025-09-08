// POST /api/purchase - Process purchase and decrement inventory
// Body: { items: [{ id: string, qty: number }...] }
// Returns 200 on success, 409 if insufficient stock
const { getInventoryStore } = require('./_blob.js');

exports.handler = async (event) => {
  const HEADERS = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'method not allowed' }) };
  }

  try {
    const { items } = JSON.parse(event.body);
    
    if (!Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({ error: 'no items' })
      };
    }

    const store = await getInventoryStore();
    const raw = await store.get('inventory.json');
    const map = raw ? JSON.parse(raw) : {};

    // Validate all items first
    const failures = [];
    for (const { id, qty } of items) {
      const rec = map[id] ?? { stock: Infinity, outOfStock: false };
      
      if (rec.outOfStock) {
        failures.push({ id, reason: 'outOfStock', stock: rec.stock ?? 0 });
      } else if (Number.isFinite(rec.stock) && rec.stock < qty) {
        failures.push({ id, reason: 'insufficient', stock: rec.stock });
      }
    }
    
    // If any validation failures, return them
    if (failures.length) {
      return {
        statusCode: 409,
        headers: HEADERS,
        body: JSON.stringify({ ok: false, failures })
      };
    }

    // All items valid - decrement stock
    for (const { id, qty } of items) {
      const rec = map[id] ?? { stock: Infinity, outOfStock: false };
      
      if (Number.isFinite(rec.stock)) {
        rec.stock = Math.max(0, rec.stock - qty);
        rec.outOfStock = rec.stock === 0 ? true : !!rec.outOfStock;
        map[id] = rec;
      }
      // If stock is Infinity, no changes needed
    }
    
    // Save updated inventory
    await store.set('inventory.json', JSON.stringify(map));
    
    // Return updated records for purchased items
    const changedInventory = Object.fromEntries(
      items.map(({ id }) => [id, map[id] ?? { stock: Infinity, outOfStock: false }])
    );
    
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ ok: true, inventory: changedInventory })
    };
    
  } catch (error) {
    console.error('Purchase error:', error);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Purchase failed' })
    };
  }
};