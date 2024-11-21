
async function includeHTML() {
    const elements = document.querySelectorAll('[data-include]');
    for (const element of elements) {
        const file = element.getAttribute('data-include');
        try {
            const response = await fetch(file);
            if (response.ok) {
                const content = await response.text();
                element.innerHTML = content;
            } else {
                console.error(`Failed to load ${file}: ${response.statusText}`);
            }
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
        }
    }
    setupEventListeners(); // Ensure event listeners are set after dynamic content is loaded
}

function setupEventListeners() {
    const hamburgerIcon = document.getElementById('hamburgerIcon');
    const navbarMenu = document.getElementById('navbarMenu');
    if (hamburgerIcon && navbarMenu) {
        hamburgerIcon.addEventListener('click', () => {
            navbarMenu.classList.toggle('active');
        });
    }
    const cartButton = document.querySelector('.cart-button');
    const cartDrawer = document.querySelector('.cart-drawer');
    const closeDrawerButton = document.querySelector('.close-drawer');
    if (cartButton && cartDrawer && closeDrawerButton) {
        cartButton.addEventListener('click', () => {
            cartDrawer.classList.toggle('open');
        });
        closeDrawerButton.addEventListener('click', () => {
            cartDrawer.classList.remove('open');
        });
    }
}

function createProductElement(product) {
    const productDiv = document.createElement('div');
    productDiv.classList.add('new-in-item');
    productDiv.innerHTML = `
        <div class="product-image-wrapper">
            <img class="main-product-img" src="${product.mainImage}" alt="${product.name}">
            <img class="hover-product-img" src="${product.hoverImage}" alt="${product.name}">
        </div>
        <h3>${product.name}</h3>
        <p>$${product.price.toFixed(2)}</p>
    `;
    return productDiv;
}

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

document.addEventListener('DOMContentLoaded', loadNewInItems);
document.addEventListener('DOMContentLoaded', includeHTML);
