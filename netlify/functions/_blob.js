// Simple inventory storage using a shared approach
// Since Netlify functions run in separate instances, we need persistent storage

// Try to use Netlify Blobs, fallback to shared memory simulation
async function getInventoryStore() {
  // Try Netlify Blobs first
  try {
    const { getStore } = require('@netlify/blobs');
    console.log('Using Netlify Blobs storage');
    return getStore('inventory');
  } catch (error) {
    console.log('Netlify Blobs not available, using temp file storage');
    
    // Fallback: Use environment variable as simple persistence
    return {
      async get(key) {
        // Try global variable first (might work within same function runtime)
        if (global.inventoryData && Object.keys(global.inventoryData).length > 0) {
          console.log('Getting inventory from global var:', global.inventoryData);
          return JSON.stringify(global.inventoryData);
        }
        
        // Fallback to environment variable
        const envData = process.env.TEMP_INVENTORY_DATA || '{}';
        console.log('Getting inventory from env var:', envData);
        return envData;
      },
      async set(key, data) {
        // This is a hack - we can't actually set env vars at runtime
        // But we'll store in a global variable that might persist for a bit
        if (global.inventoryData === undefined) {
          global.inventoryData = {};
        }
        global.inventoryData = JSON.parse(data);
        console.log('Storing in global variable:', global.inventoryData);
        
        // Log that this data would need to be set in Netlify env vars for persistence
        console.log('For persistence, set TEMP_INVENTORY_DATA env var to:', data);
        return true;
      }
    };
  }
}

module.exports = { getInventoryStore };