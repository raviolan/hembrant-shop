// GET /api/inventory - Fetch current inventory state
// Optional query: ?ids=id1,id2 to get specific products only
import { getInventoryStore, HEADERS } from './_blob.js';

export default async (request) => {
  try {
    const store = await getInventoryStore();
    const raw = await store.get('inventory.json');
    const fullMap = raw ? JSON.parse(raw) : {};
    
    // Check if specific IDs requested
    const url = new URL(request.url);
    const idsParam = url.searchParams.get('ids');
    
    if (idsParam) {
      // Return only requested IDs
      const requestedIds = idsParam.split(',').map(id => id.trim());
      const filteredMap = {};
      requestedIds.forEach(id => {
        filteredMap[id] = fullMap[id] || { stock: Infinity, outOfStock: false };
      });
      return new Response(JSON.stringify(filteredMap), { headers: HEADERS, status: 200 });
    }
    
    // Return full inventory map
    return new Response(JSON.stringify(fullMap), { headers: HEADERS, status: 200 });
    
  } catch (error) {
    console.error('Inventory get error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to load inventory' }), 
      { headers: HEADERS, status: 500 }
    );
  }
};