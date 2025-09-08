// Simple inventory storage using environment variables
// This provides a working solution until Netlify Blobs is properly configured

// In-memory store (resets on function cold start, but good for testing)
let memoryStore = {};

async function getInventoryStore() {
  return {
    async get(key) {
      const storeData = Object.keys(memoryStore).length > 0 ? memoryStore : {};
      console.log('Getting inventory store data:', storeData);
      return JSON.stringify(storeData);
    },
    async set(key, data) {
      // Store in memory for this function instance
      memoryStore = JSON.parse(data);
      console.log('Setting inventory store data:', memoryStore);
      console.log('Inventory updated in memory:', Object.keys(memoryStore).length, 'items');
      return true;
    }
  };
}

module.exports = { getInventoryStore };