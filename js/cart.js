// Navbar toggle functionality
function setupNavbarToggle() {
    const hamburgerIcon = document.getElementById('hamburgerIcon');
    const navbarMenu = document.getElementById('navbarMenu');
    if (hamburgerIcon && navbarMenu) {
        hamburgerIcon.addEventListener('click', () => {
            navbarMenu.classList.toggle('active');
        });
    }
}

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
    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);
    updateCartCount();
    updateCartUI();
    openCartDrawer(); // Automatically open the cart drawer
}

function openCartDrawer() {
    const cartDrawer = document.querySelector('.cart-drawer');
    if (cartDrawer) {
        cartDrawer.classList.add('open');
    }
}

function setupCartDrawer() {
    const cartButton = document.querySelector('.cart-button');
    const cartDrawer = document.querySelector('.cart-drawer');
    const closeCartButton = document.querySelector('.close-drawer');

    if (cartButton && cartDrawer && closeCartButton) {
        cartButton.addEventListener('click', () => {
            cartDrawer.classList.toggle('open');
        });
        closeCartButton.addEventListener('click', () => {
            cartDrawer.classList.remove('open');
        });

        // Prevent cart drawer from closing when clicking inside it
        cartDrawer.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click events inside the drawer from propagating
        });

        // Close the drawer when clicking outside of it
        document.addEventListener('click', (e) => {
            if (!cartDrawer.contains(e.target) && !cartButton.contains(e.target)) {
                cartDrawer.classList.remove('open');
            }
        });
    }
}


function updateCartUI() {
    const cart = loadCart();
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalPriceElement = document.querySelector('.total-price');
    const emptyMessageElement = document.querySelector('.empty-message');

    if (cartItemsContainer) {
        if (cart.length > 0) {
            cartItemsContainer.innerHTML = cart
                .map(item => `
                    <div class="cart-item">
                        <img src="${item.mainImage}" alt="${item.name}" class="cart-item-image">
                        <div>
                            <p><strong>${item.name}</strong></p>
                            <p>GP ${item.price.toFixed(2)}</p>
                            <div class="quantity-controls">
                                <button class="decrease-quantity" data-id="${item.id}">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="increase-quantity" data-id="${item.id}">+</button>
                            </div>
                            <button data-id="${item.id}" class="remove-item">Remove</button>
                        </div>
                    </div>
                `).join('');
        } else {
            cartItemsContainer.innerHTML = '<p class="empty-message">Your cart is empty!</p>';
        }
    }

    if (emptyMessageElement) {
        emptyMessageElement.style.display = cart.length === 0 ? 'block' : 'none';
    }

    if (totalPriceElement) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity || 0), 0);
        totalPriceElement.textContent = `Total: GP ${total.toFixed(2)}`;
    }

    attachCartListeners(); // Ensure all buttons work after UI updates
}

function attachCartListeners() {
    // Increase quantity
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent layout jumping
            const productId = e.target.getAttribute('data-id');
            const cart = loadCart();
            const product = cart.find(item => item.id == productId);
            if (product) {
                updateItemQuantity(productId, product.quantity + 1);
            }
        });
    });

    // Decrease quantity
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent layout jumping
            const productId = e.target.getAttribute('data-id');
            const cart = loadCart();
            const product = cart.find(item => item.id == productId);
            if (product && product.quantity > 1) {
                updateItemQuantity(productId, product.quantity - 1);
            } else {
                updateItemQuantity(productId, 0); // Remove item if quantity becomes 0
            }
        });
    });

    // Remove item
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent layout jumping
            const productId = e.target.getAttribute('data-id');
            updateItemQuantity(productId, 0);
        });
    });
}


function updateCartCount() {
    const cart = loadCart();
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

function updateItemQuantity(productId, newQuantity) {
    const cart = loadCart();
    const productIndex = cart.findIndex(item => item.id == productId);
    if (productIndex !== -1) {
        if (newQuantity > 0) {
            cart[productIndex].quantity = newQuantity;
        } else {
            cart.splice(productIndex, 1);
        }
        saveCart(cart);
        updateCartCount();
        updateCartUI();
    }
}

// Include dynamic HTML components
async function includeHTML(callback) {
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
    if (typeof callback === 'function') callback();
}

document.addEventListener('DOMContentLoaded', () => {
    includeHTML(() => {
        setupNavbarToggle(); // Ensure header functionality is included
        setupCartDrawer();  // Ensure cart drawer setup works
        updateCartCount();  // Update cart icon count
        updateCartUI();     // Render cart items
    });
});
