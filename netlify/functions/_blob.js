// Shared blob storage helper for inventory management
import { getStore } from '@netlify/blobs';

// Get the inventory-specific blob store
export async function getInventoryStore() {
  return getStore('inventory'); // namespaced store for inventory data
}

// Common headers for all inventory API responses
export const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store' // Never cache inventory data
};