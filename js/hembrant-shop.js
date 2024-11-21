// Function to create a product element for the "New In" section
function createProductElement(product) {
    const productDiv = document.createElement('div');
    productDiv.classList.add('new-in-item');
    productDiv.innerHTML = `
        <div class="product-image-wrapper">
            <img class="main-product-img" src="${product.mainImage}" alt="${product.name}">
            <img class="hover-product-img" src="${product.hoverImage}" alt="${product.name}">
        </div>
        <h3>${product.name}</h3>
        <p>GP ${product.price.toFixed(2)}</p>
        <button onclick='addToCart(${JSON.stringify(product)})'>Add to Cart</button>
    `;
    return productDiv;
}

// Function to load "New In" products
function loadNewInItems() {
    fetch('/products.json')
        .then(response => response.json())
        .then(products => {
            const newInGrid = document.querySelector('.new-in-grid');
            const newInItems = products.slice(0, 4); // Pull the first 4 products
            newInGrid.innerHTML = '';
            newInItems.forEach(product => {
                const productElement = createProductElement(product);
                newInGrid.appendChild(productElement);
            });
        })
        .catch(error => console.error('Error loading New In items:', error));
}

// Initialize the homepage
document.addEventListener('DOMContentLoaded', loadNewInItems);
