
// Ensure navbar toggle functionality exists
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
}

function updateCartCount() {
    const cart = loadCart();
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems > 0 ? totalItems : '0';
    }
}

function updateItemQuantity(productId, newQuantity) {
    const cart = loadCart();
    console.log(`Cart before update:`, cart); // Debugging

    const productIndex = cart.findIndex(item => item.id == productId); // Use == for type flexibility in data-id
    if (productIndex !== -1) {
        if (newQuantity > 0) {
            cart[productIndex].quantity = newQuantity;
            console.log(`Updated quantity for: ${productId}, new quantity: ${newQuantity}`); // Debugging
        } else {
            console.log(`Removing item: ${cart[productIndex]}`); // Debugging
            cart.splice(productIndex, 1); // Remove item from array
        }
        saveCart(cart); // Save updated cart to storage
        console.log(`Cart after update:`, cart); // Debugging
    } else {
        console.error(`Product with ID: ${productId} not found in cart.`); // Debugging
    }

    updateCartUI(); // Refresh UI after updating the cart
}

function updateCartUI() {
    const cart = loadCart(); // Always fetch the latest cart
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalPriceElement = document.querySelector('.total-price');
    const emptyMessageElement = document.querySelector('.empty-message');
    console.log(`Updating cart UI with cart:`, cart); // Debugging

    if (cartItemsContainer) {
        if (cart.length > 0) {
            cartItemsContainer.innerHTML = cart
                .map(item => `
                    <div class="cart-item">
                        <span>${item.name}</span>
                        <span>GP ${item.price.toFixed(2)}</span>
                        <input type="number" value="${item.quantity}" min="0" data-id="${item.id}" class="quantity-input" />
                        <button data-id="${item.id}" class="remove-item">Remove</button>
                    </div>
                `).join('');
        } else {
            cartItemsContainer.innerHTML = ''; // Clear the container if the cart is empty
        }
    }

    if (emptyMessageElement) {
        emptyMessageElement.style.display = cart.length === 0 ? 'block' : 'none'; // Show/hide empty cart message
    }

    if (totalPriceElement) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity || 0), 0);
        totalPriceElement.textContent = `Total: GP ${total.toFixed(2)}`;
    }

    attachCartListeners(); // Ensure all event listeners are reattached
}



function attachCartListeners() {
    // Attach listeners for quantity change
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const productId = e.target.getAttribute('data-id');
            const newQuantity = parseInt(e.target.value, 10);
            console.log(`Changing quantity for: ${productId}, new quantity: ${newQuantity}`); // Debugging
            if (!isNaN(newQuantity)) {
                updateItemQuantity(productId, newQuantity);
            }
        });
    });

    // Attach listeners for remove button
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.getAttribute('data-id');
            console.log(`Removing item with ID: ${productId}`); // Debugging
            updateItemQuantity(productId, 0);
        });
    });
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
    }
}

// Dynamically include HTML components
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
        setupCartDrawer();
        setupNavbarToggle();
        updateCartCount();
        updateCartUI(); // Ensure cart is initialized after HTML inclusion
    });
});
