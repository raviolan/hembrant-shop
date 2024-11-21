// Function to load and display category-specific products
async function loadCategory(categoryName) {
    try {
        const response = await fetch('../products.json');
        const products = await response.json();

        // Filter products by category
        const filteredProducts = products.filter(product => product.category === categoryName);

        // Render the products dynamically
        const categoryGrid = document.querySelector('.category-grid');
        if (categoryGrid) {
            categoryGrid.innerHTML = filteredProducts
                .map(product => `
                    <div class="product-item">
                        <div class="product-image-wrapper">
                            <img class="main-product-img" src="${product.mainImage}" alt="${product.name}">
                            <img class="hover-product-img" src="${product.hoverImage}" alt="${product.name}">
                        </div>
                        <h3>${product.name}</h3>
                        <p>GP ${product.price.toFixed(2)}</p>
                        <button onclick='addToCart(${JSON.stringify(product)})'>Add to Cart</button>
                    </div>
                `)
                .join('');
        }
    } catch (error) {
        console.error("Error loading category:", error);
    }
}

// Initialize the category page
document.addEventListener('DOMContentLoaded', () => {
    const categoryElement = document.querySelector('main[data-category]');
    if (categoryElement) {
        const categoryName = categoryElement.dataset.category;
        loadCategory(categoryName);
    }
});
