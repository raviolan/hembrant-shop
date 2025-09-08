// GET /api/inventory - Fetch current inventory state
// Optional query: ?ids=id1,id2 to get specific products only
const { getInventoryStore, HEADERS } = require('./_blob.js');

exports.handler = async (event, context) => {
  const request = { url: `${event.headers.origin || 'https://example.com'}${event.path}${event.multiValueQueryStringParameters ? '?' + new URLSearchParams(event.multiValueQueryStringParameters).toString() : ''}` };
  try {
    const store = await getInventoryStore();
    const raw = await store.get('inventory.json');
    const fullMap = raw ? JSON.parse(raw) : {};
    
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