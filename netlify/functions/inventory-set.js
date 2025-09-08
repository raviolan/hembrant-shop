// POST /api/inventory/set - DM/admin only endpoint to update stock
// Requires x-admin-token header matching ADMIN_TOKEN env var
// Body: { id: string, stock?: number, outOfStock?: boolean }
import { getInventoryStore, HEADERS } from './_blob.js';

export default async (request) => {
  try {
    // Verify admin token
    const token = request.headers.get('x-admin-token');
    if (!token || token !== process.env.ADMIN_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'unauthorized' }), 
        { headers: HEADERS, status: 401 }
      );
    }
    
    const { id, stock, outOfStock } = await request.json();
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'missing id' }), 
        { headers: HEADERS, status: 400 }
      );
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
    
    return new Response(JSON.stringify(map[id]), { headers: HEADERS, status: 200 });
    
  } catch (error) {
    console.error('Inventory set error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update inventory' }), 
      { headers: HEADERS, status: 500 }
    );
  }
};