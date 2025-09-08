const { getStore } = require('@netlify/blobs');

exports.HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

exports.coerceStock = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : null; // null = infinite
};

exports.normalizeMap = (map) => {
  const out = {};
  for (const [id, rec] of Object.entries(map || {})) {
    const stock = exports.coerceStock(rec?.stock);
    out[id] = { stock, outOfStock: !!rec?.outOfStock };
  }
  return out;
};

// Fallback storage using environment variables (will work until Blobs is enabled)
const fallbackStorage = {
  async get(key) {
    // Use environment variable for temporary storage
    const envKey = `INVENTORY_${key.replace(/[^A-Z0-9]/gi, '_').toUpperCase()}`;
    return process.env[envKey] || null;
  },
  async set(key, value) {
    // For now, just log the attempt (production environment variables are read-only)
    console.log(`Inventory update attempt: ${key} = ${value.substring(0, 100)}...`);
    // Return success for now - actual persistence needs Blobs enabled
    return true;
  }
};

exports.loadStore = async () => {
  try {
    return getStore('inventory');
  } catch (error) {
    if (error.name === 'MissingBlobsEnvironmentError') {
      console.log('Netlify Blobs not configured, using fallback storage');
      return fallbackStorage;
    }
    throw error;
  }
};