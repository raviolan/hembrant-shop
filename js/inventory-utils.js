// Shared inventory utilities for client-side integration

// Fetch inventory for specific product IDs
async function getInventory(ids = null) {
    const qs = ids && ids.length ? `?ids=${encodeURIComponent(ids.join(','))}` : '';
    const res = await fetch(`/api/inventory${qs}`, { cache: 'no-store' });
    return res.json();
}

// Apply stock state to a product element - returns modified product object
function applyStockState(product, invMap, buttonSelector = 'button') {
    const rec = invMap[product.id];
    const finite = rec && Number.isFinite(rec.stock);
    const oos = rec?.outOfStock || (finite && rec.stock === 0);
    const lowStock = finite && rec.stock <= 10 && rec.stock > 0;
    
    // Return product with stock info for use in rendering
    return {
        ...product,
        stock: rec?.stock ?? Infinity,
        outOfStock: oos,
        lowStock: lowStock,
        stockLabel: oos ? 'Out of stock' : (lowStock ? `${rec.stock} left` : ''),
        canAddToCart: !oos
    };
}

// Update existing DOM elements with stock state
function updateDOMWithStock(element, stockProduct) {
    // Find and update add to cart button
    const button = element.querySelector('button');
    if (button) {
        button.disabled = !stockProduct.canAddToCart;
        if (!stockProduct.canAddToCart) {
            button.textContent = 'Out of Stock';
            button.classList.add('disabled');
        }
    }
    
    // Add stock badge if needed
    if (stockProduct.stockLabel) {
        let badge = element.querySelector('.stock-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'stock-badge';
            // Insert after product name/price area
            const priceElement = element.querySelector('p');
            if (priceElement) {
                priceElement.parentNode.insertBefore(badge, priceElement.nextSibling);
            } else {
                element.appendChild(badge);
            }
        }
        badge.textContent = stockProduct.stockLabel;
        badge.classList.toggle('out-of-stock', stockProduct.outOfStock);
        badge.classList.toggle('low-stock', stockProduct.lowStock);
    }
}

// Format price consistently
function formatPrice(price) {
    return `GP ${price.toFixed(2)}`;
}