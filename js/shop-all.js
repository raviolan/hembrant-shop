document.addEventListener("DOMContentLoaded", () => {
    // Select the main element for "Shop All"
    const mainElement = document.querySelector("main[data-category='all']");
    if (!mainElement) return;

    fetch("/products.json")
        .then(response => response.json())
        .then(products => {
            // Sort products by dateAdded (newest first)
            products.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

            // Select the grid container (match category structure)
            const shopAllGrid = document.querySelector(".category-grid");

            // Render all products
            shopAllGrid.innerHTML = products.map(product => `
                <div class="product-card">
                    <a href="/products.html?id=${product.id}">
                        <img 
                            class="main-product-img" 
                            src="${product.mainImage}" 
                            alt="${product.name}" 
                            onmouseover="this.src='${product.hoverImage}'" 
                            onmouseout="this.src='${product.mainImage}'">
                        <h3>${product.name}</h3>
                        <p>GP ${product.price.toFixed(2)}</p>
                    </a>
                    <button onclick='addToCart(${JSON.stringify(product)})'>Add to Cart</button>
                </div>
            `).join("");
        })
        .catch(error => console.error("Failed to load all products:", error));
});
