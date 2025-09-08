// Function to create a product element for the "New In" section
function createProductElement(product) {
    const productDiv = document.createElement('div');
    productDiv.classList.add('new-in-item');
    productDiv.innerHTML = `
        <div class="product-image-wrapper">
            <img 
                class="main-product-img" 
                src="${product.mainImage}" 
                alt="${product.name}">
            <h3>${product.name}</h3>
            <p>GP ${product.price.toFixed(2)}</p>
            <button onclick='addToCart(${JSON.stringify(product)})'>Add to Cart</button>
        </div>
    `;
    return productDiv;
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const products = await fetch("/products.json").then(res => res.json());
        const selectedProducts = products.slice(20, 41); // Display the selected products
        
        // Get inventory for these products
        const productIds = selectedProducts.map(p => p.id);
        const inventory = await fetch(`/api/inventory?ids=${encodeURIComponent(productIds.join(','))}`, { cache: 'no-store' })
            .then(res => res.json())
            .catch(() => ({})); // Fallback if inventory service unavailable
        
        const newInSection = document.querySelector(".new-in-grid");
        
        // Build DOM fragment to avoid multiple reflows
        const fragment = document.createDocumentFragment();
        
        selectedProducts.forEach(product => {
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
                        class="main-product-img" 
                        src="${product.mainImage}" 
                        alt="${product.name}" 
                        data-hover="${product.hoverImage}" 
                        data-main="${product.mainImage}"
                        loading="lazy">
                    <h3>${product.name}</h3>
                    <p>GP ${product.price.toFixed(2)}</p>
                    ${stockLabel ? `<span class="stock-badge ${oos ? 'out-of-stock' : 'low-stock'}">${stockLabel}</span>` : ''}
                </a>
                <button onclick='addToCart(${JSON.stringify(product)})' ${buttonDisabled} class="${buttonClass}">${buttonText}</button>
            `;
            
            fragment.appendChild(productDiv);
        });
        
        newInSection.appendChild(fragment);

        // Attach hover functionality dynamically
        document.querySelectorAll(".product-card img").forEach(img => {
            img.addEventListener("mouseover", () => {
                const hoverImage = img.getAttribute("data-hover");
                if (hoverImage) {
                    img.src = hoverImage;
                }
            });
            img.addEventListener("mouseout", () => {
                const mainImage = img.getAttribute("data-main");
                img.src = mainImage;
            });
        });
        
    } catch (error) {
        console.error("Failed to load new in products:", error);
    }
});
