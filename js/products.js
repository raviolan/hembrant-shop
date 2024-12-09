// Extract product ID from URL
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

if (productId) {
    // Fetch the product details
    fetch('/products.json')
        .then(response => response.json())
        .then(products => {
            const product = products.find(p => p.id == productId);
            if (product) {
                renderProductDetails(product);
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
    productDetails.innerHTML = `
        <div class="product-detail-container">
            <img src="${product.mainImage}" alt="${product.name}" class="product-main-image">
            <h1>${product.name}</h1>
            <p><strong>Category:</strong> ${capitalizeFirstLetter(product.category)}</p>
            <p>${product.description}</p>
            <p>GP ${product.price.toFixed(2)}</p>
            <p><strong>Date Added:</strong> ${formatDate(product.dateAdded)}</p>
            <button onclick='addToCart(${JSON.stringify(product)})'>Add to Cart</button>
        </div>
    `;
}

// Utility function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Utility function to format date strings
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
