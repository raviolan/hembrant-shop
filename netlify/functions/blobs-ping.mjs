import { getStore } from '@netlify/blobs';

export default async function handler() {
  try {
    const siteID = process.env.NETLIFY_BLOBS_SITE_ID || process.env.SITE_ID || process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_BLOBS_TOKEN;
    // Try manual creds first (works in any env), else auto (v2)
    const store = (siteID && token) ? getStore('inventory', { siteID, token }) : getStore('inventory');
    await store.set('__ping__.txt', 'ok');
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ ok: false, error: String(e) }) };
  }
}
