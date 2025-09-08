document.addEventListener("DOMContentLoaded", async () => {
    const category = document.querySelector("main").getAttribute("data-category");

    try {
        const products = await fetch("/products.json").then(res => res.json());
        const filteredProducts = products.filter(product => product.category === category);
        
        // Get inventory for these products
        const productIds = filteredProducts.map(p => p.id);
        const inventory = await fetch(`/api/inventory?ids=${encodeURIComponent(productIds.join(','))}`, { cache: 'no-store' })
            .then(res => res.json())
            .catch(() => ({})); // Fallback if inventory service unavailable
        
        const grid = document.querySelector(".category-grid");
        
        // Build DOM fragment to avoid multiple reflows
        const fragment = document.createDocumentFragment();
        
        filteredProducts.forEach(product => {
            const rec = inventory[product.id];
            const finite = rec && Number.isFinite(rec.stock);
            const oos = rec?.outOfStock || (finite && rec.stock === 0);
            const lowStock = finite && rec.stock <= 10 && rec.stock > 0;
            
            const productDiv = document.createElement('div');
            productDiv.className = 'product-card';
            
            const stockLabel = oos ? 'Out of stock' : (lowStock ? `${rec.stock} left` : '');
            const buttonText = oos ? 'Out of Stock' : 'Add to Cart';
            const buttonDisabled = oos ? 'disabled' : '';
            const buttonClass = oos ? 'disabled' : '';
            
            productDiv.innerHTML = `
                <a href="/products.html?id=${product.id}">
                    <img 
                        src="${product.mainImage}" 
                        alt="${product.name}" 
                        onmouseover="this.src='${product.hoverImage}'" 
                        onmouseout="this.src='${product.mainImage}'"
                        loading="lazy">
                    <h3>${product.name}</h3>
                    <p>GP ${product.price.toFixed(2)}</p>
                    ${stockLabel ? `<span class="stock-badge ${oos ? 'out-of-stock' : 'low-stock'}">${stockLabel}</span>` : ''}
                </a>
                <button onclick='addToCart(${JSON.stringify(product)})' ${buttonDisabled} class="${buttonClass}">${buttonText}</button>
            `;
            
            fragment.appendChild(productDiv);
        });
        
        grid.appendChild(fragment);
        
    } catch (error) {
        console.error("Failed to load products:", error);
    }
});

// Initialize the category page
document.addEventListener('DOMContentLoaded', () => {
    const categoryElement = document.querySelector('main[data-category]');
    if (categoryElement) {
        const categoryName = categoryElement.dataset.category;
        loadCategory(categoryName);
    }
});
