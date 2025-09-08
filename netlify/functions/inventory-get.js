// GET /api/inventory - Fetch current inventory state
// Optional query: ?ids=id1,id2 to get specific products only
const { getInventoryStore } = require('./_blob.js');

exports.handler = async (event) => {
  const HEADERS = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  try {
    console.log('inventory-get: Starting request');
    const store = await getInventoryStore();
    console.log('inventory-get: Got store');
    const raw = await store.get('inventory.json');
    console.log('inventory-get: Got raw data:', raw ? 'data present' : 'no data');
    const fullMap = raw ? JSON.parse(raw) : {};
    console.log('inventory-get: Parsed map with', Object.keys(fullMap).length, 'items');
    
    // Check if specific IDs requested  
    const idsParam = event.queryStringParameters?.ids;
    
    if (idsParam) {
      // Return only requested IDs
      const requestedIds = idsParam.split(',').map(id => id.trim());
      const filteredMap = {};
      requestedIds.forEach(id => {
        filteredMap[id] = fullMap[id] || { stock: Infinity, outOfStock: false };
      });
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify(filteredMap)
      };
    }
    
    // Return full inventory map
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(fullMap)
    };
    
  } catch (error) {
    console.error('Inventory get error:', error);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Failed to load inventory' })
    };
  }
};