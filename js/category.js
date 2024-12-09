document.addEventListener("DOMContentLoaded", () => {
    const category = document.querySelector("main").getAttribute("data-category");

    fetch("/products.json")
        .then(response => response.json())
        .then(products => {
            const filteredProducts = products.filter(product => product.category === category);
            const grid = document.querySelector(".category-grid");

            grid.innerHTML = filteredProducts.map(product => `
                <div class="product-card">
                    <a href="/products.html?id=${product.id}">
                        <img 
                            src="${product.mainImage}" 
                            alt="${product.name}" 
                            onmouseover="this.src='${product.hoverImage}'" 
                            onmouseout="this.src='${product.mainImage}'">
                        <h3>${product.name}</h3>
                        <p>GP ${product.price.toFixed(2)}</p>
                    </a>
                    <button onclick='addToCart(${JSON.stringify(product)})'>Add to Cart</button>
                </div>
            `).join('');
        })
        .catch(error => console.error("Failed to load products:", error));
});

// Initialize the category page
document.addEventListener('DOMContentLoaded', () => {
    const categoryElement = document.querySelector('main[data-category]');
    if (categoryElement) {
        const categoryName = categoryElement.dataset.category;
        loadCategory(categoryName);
    }
});
