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

document.addEventListener("DOMContentLoaded", () => {
    fetch("/products.json")
        .then(response => response.json())
        .then(products => {
            const newInSection = document.querySelector(".new-in-grid");

            // Render product cards dynamically
            newInSection.innerHTML = products
                .slice(12, 17) // Display the first 4 products
                .map(product => `
                    <div class="product-card">
                        <a href="/products.html?id=${product.id}">
                            <img 
                                class="main-product-img" 
                                src="${product.mainImage}" 
                                alt="${product.name}">
                            <h3>${product.name}</h3>
                            <p>GP ${product.price.toFixed(2)}</p>
                        </a>
                        <button onclick='addToCart(${JSON.stringify(product)})'>Add to Cart</button>
                    </div>
                `)
                .join("");

            // Attach hover functionality dynamically
            document.querySelectorAll(".product-card img").forEach((img, index) => {
                const product = products[index];
                if (product) {
                    img.addEventListener("mouseover", () => {
                        if (product.hoverImage) {
                            img.src = product.hoverImage;
                        }
                    });
                    img.addEventListener("mouseout", () => {
                        img.src = product.mainImage;
                    });
                }
            });
        })
        .catch(error => console.error("Failed to load new in products:", error));
});
