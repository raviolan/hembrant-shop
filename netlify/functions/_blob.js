// Simple inventory storage using environment variables
// This provides a working solution until Netlify Blobs is properly configured

// In-memory store (resets on function cold start, but good for testing)
let memoryStore = {};

async function getInventoryStore() {
  return {
    async get(key) {
      // Try memory first, then env var, then default
      if (Object.keys(memoryStore).length > 0) {
        return JSON.stringify(memoryStore);
      }
      return process.env.INVENTORY_DATA || '{}';
    },
    async set(key, data) {
      // Store in memory for this function instance
      memoryStore = JSON.parse(data);
      console.log('Inventory updated in memory:', Object.keys(memoryStore).length, 'items');
      return true;
    }
  };
}

module.exports = { getInventoryStore };