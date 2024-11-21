// Cart management functions
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function addToCart(product) {
    const cart = loadCart();
    cart.push(product);
    saveCart(cart);
    updateCartUI();
}

function updateCartUI() {
    const cart = loadCart();
    const cartDrawer = document.querySelector('.cart-drawer');
    const cartItemsContainer = cartDrawer?.querySelector('.cart-items');
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = cart
            .map(item => `<div>${item.name} - GP ${item.price}</div>`)
            .join('');
    }
}

// Cart drawer toggling
function setupCartDrawer() {
    const cartButton = document.querySelector('.cart-button');
    const cartDrawer = document.querySelector('.cart-drawer');
    const closeCartButton = document.querySelector('.close-drawer');

    if (cartButton && cartDrawer && closeCartButton) {
        cartButton.addEventListener('click', () => {
            cartDrawer.classList.remove('hidden'); // Ensure hidden class is removed
            cartDrawer.classList.add('open');
        });
        closeCartButton.addEventListener('click', () => {
            cartDrawer.classList.remove('open');
            cartDrawer.classList.add('hidden'); // Re-add hidden class
        });
    }
}

// Hamburger menu toggling
function setupNavbarToggle() {
    const hamburgerIcon = document.getElementById('hamburgerIcon');
    const navbarMenu = document.getElementById('navbarMenu');
    if (hamburgerIcon && navbarMenu) {
        hamburgerIcon.addEventListener('click', () => {
            navbarMenu.classList.toggle('active');
        });
    }
}

// Function to dynamically include HTML components
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

    // Setup event listeners after content is included
    setupCartDrawer();
    setupNavbarToggle();
    updateCartUI();
}

// Initialize shared functionality
document.addEventListener('DOMContentLoaded', () => {
    includeHTML();
});
