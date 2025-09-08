exports.handler = async () => {
  try {
    const { getStore } = require('@netlify/blobs');
    const ok = typeof getStore === 'function';
    if (ok) {
      const s = getStore('inventory');
      await s.set('__ping__.txt', 'ok');
    }
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ ok, storage: ok ? 'blobs' : 'none' }) };
  } catch (e) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ ok: false, error: String(e) }) };
  }
};