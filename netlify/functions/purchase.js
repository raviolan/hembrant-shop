// POST /api/purchase - Process purchase and decrement inventory
// Body: { items: [{ id: string, qty: number }...] }
// Returns 200 on success, 409 if insufficient stock
import { getInventoryStore, HEADERS } from './_blob.js';

export default async (request) => {
  try {
    const { items } = await request.json();
    
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'no items' }), 
        { headers: HEADERS, status: 400 }
      );
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
      return new Response(
        JSON.stringify({ ok: false, failures }), 
        { headers: HEADERS, status: 409 }
      );
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
    
    return new Response(
      JSON.stringify({ ok: true, inventory: changedInventory }), 
      { headers: HEADERS, status: 200 }
    );
    
  } catch (error) {
    console.error('Purchase error:', error);
    return new Response(
      JSON.stringify({ error: 'Purchase failed' }), 
      { headers: HEADERS, status: 500 }
    );
  }
};