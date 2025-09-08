// Simple inventory storage using environment variables and global state
// Since serverless functions are stateless, we use env vars for persistence

async function getInventoryStore() {
  return {
    async get(key) {
      // Try global variable first (works within same function instance)
      if (global.inventoryData && Object.keys(global.inventoryData).length > 0) {
        console.log('Getting inventory from global var:', global.inventoryData);
        return JSON.stringify(global.inventoryData);
      }
      
      // Fallback to environment variable for cross-function persistence
      const envData = process.env.TEMP_INVENTORY_DATA || '{}';
      console.log('Getting inventory from env var:', envData);
      
      // Store in global for this instance
      try {
        global.inventoryData = JSON.parse(envData);
      } catch (e) {
        global.inventoryData = {};
      }
      
      return envData;
    },
    
    async set(key, data) {
      // Store in global variable for this function instance
      if (global.inventoryData === undefined) {
        global.inventoryData = {};
      }
      global.inventoryData = JSON.parse(data);
      console.log('Storing in global variable:', global.inventoryData);
      
      // Log the data that should be set in TEMP_INVENTORY_DATA env var for persistence
      console.log('For persistence across deploys, set TEMP_INVENTORY_DATA env var to:', data);
      return true;
    }
  };
}

module.exports = { getInventoryStore };