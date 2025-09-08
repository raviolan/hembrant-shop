// Inventory API helper functions
window.InventoryAPI = (function() {
  async function getInventory(ids) {
    const qs = ids && ids.length ? `?ids=${encodeURIComponent(ids.join(','))}` : '';
    const res = await fetch(`/api/inventory${qs}`, { cache: 'no-store' });
    return res.json();
  }

  async function purchase(items) {
    const res = await fetch('/api/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ items })
    });
    if (res.status === 200) return { ok: true, data: await res.json() };
    if (res.status === 409) return { ok: false, data: await res.json() };
    throw new Error('Purchase failed');
  }

  return {
    getInventory,
    purchase
  };
})();