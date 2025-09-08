// Shared blob storage helper for inventory management
const { getStore } = require('@netlify/blobs');

// Get the inventory-specific blob store
async function getInventoryStore() {
  return getStore('inventory'); // namespaced store for inventory data
}

// Common headers for all inventory API responses
const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store' // Never cache inventory data
};

module.exports = { getInventoryStore, HEADERS };