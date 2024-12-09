// Extract product ID from URL
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

if (productId) {
    fetch('/products.json')
        .then(response => response.json())
        .then(products => {
            const product = products.find(p => p.id == productId);
            if (product) {
                renderProductDetails(product);
                renderRelatedProducts(products, product.category, productId);
            } else {
                document.getElementById('product-details').innerHTML = '<p>Product not found!</p>';
            }
        })
        .catch(err => {
            console.error("Error loading products:", err);
            document.getElementById('product-details').innerHTML = '<p>Error loading product details.</p>';
        });
} else {
    document.getElementById('product-details').innerHTML = '<p>Invalid product ID.</p>';
}

// Function to render product details
function renderProductDetails(product) {
    const productDetails = document.getElementById('product-details');

    // Collect all images: main, hover, and extra images dynamically
    const galleryImages = [product.mainImage, product.hoverImage]
        .concat(
            Object.keys(product)
                .filter(key => key.startsWith('extraImage')) // Find keys like extraImage1, extraImage2
                .map(key => product[key])
        )
        .filter(Boolean); // Filter out undefined or null values

    const thumbnails = galleryImages.map((image, index) => `
        <img 
            src="${image}" 
            class="product-thumbnail ${index === 0 ? 'active' : ''}" 
            onclick="updateMainImage('${image}', this)">
    `).join('');

    productDetails.innerHTML = `
        <div class="product-image-gallery">
            <img 
                src="${product.mainImage}" 
                alt="${product.name}" 
                id="main-product-image" 
                class="product-main-image">
            <div class="product-thumbnails">
                ${thumbnails}
            </div>
        </div>
        <div class="product-detail-container">
            <h1>${product.name}</h1>
            <p>${product.description}</p>
            <p><strong>Price:</strong> GP ${product.price.toFixed(2)}</p>
            <button onclick='addToCart(${JSON.stringify(product)})'>Add to Cart</button>
        </div>
    `;
}

// Function to update main image
function updateMainImage(imageUrl, thumbnailElement) {
    const mainImage = document.getElementById('main-product-image');
    mainImage.src = imageUrl;

    // Highlight the active thumbnail
    document.querySelectorAll('.product-thumbnail').forEach(thumbnail => {
        thumbnail.classList.remove('active');
    });
    thumbnailElement.classList.add('active');
}

// Function to render related products
function renderRelatedProducts(products, category, productId) {
    const relatedProducts = products.filter(p => p.category === category && p.id != productId).slice(0, 4);
    const grid = document.querySelector('.related-products-grid');
    grid.innerHTML = relatedProducts.map(product => `
        <div class="related-product-card">
            <a href="/products.html?id=${product.id}">
                <img src="${product.mainImage}" alt="${product.name}">
                <h3>${product.name}</h3>
            </a>
        </div>
    `).join('');
}
