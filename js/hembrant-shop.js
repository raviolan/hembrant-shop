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
            const selectedProducts = products.slice(13, 18); // Display the selected products
            newInSection.innerHTML = selectedProducts
                .map(product => `
                     <div class="product-card">
                         <a href="/products.html?id=${product.id}">
                             <img 
                                 class="main-product-img" 
                                 src="${product.mainImage}" 
                                 alt="${product.name}" 
                                 data-hover="${product.hoverImage}" 
                                 data-main="${product.mainImage}">
                             <h3>${product.name}</h3>
                             <p>GP ${product.price.toFixed(2)}</p>
                         </a>
                         <button onclick='addToCart(${JSON.stringify(product)})'>Add to Cart</button>
                     </div>
                 `)
                .join("");

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
        })
        .catch(error => console.error("Failed to load new in products:", error));
});
