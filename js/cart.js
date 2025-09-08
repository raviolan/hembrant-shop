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
        cartButton.addEventListener('click', async () => {
            cartDrawer.classList.toggle('open');
            // Refresh inventory when opening cart
            if (cartDrawer.classList.contains('open')) {
                await refreshCartInventory();
            }
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
    const checkoutButton = document.querySelector('.checkout-button');

    if (cartItemsContainer) {
        if (cart.length > 0) {
            const hasOutOfStockItems = cart.some(item => item.outOfStock);
            
            cartItemsContainer.innerHTML = cart
                .map(item => {
                    const stockWarning = item.outOfStock 
                        ? '<p class="stock-warning">Out of stock - remove to proceed</p>'
                        : (Number.isFinite(item.currentStock) && item.currentStock < item.quantity)
                        ? `<p class="stock-warning">Only ${item.currentStock} available</p>`
                        : '';
                    
                    return `
                        <div class="cart-item ${item.outOfStock ? 'out-of-stock' : ''}">
                            <img src="${item.mainImage}" alt="${item.name}" class="cart-item-image">
                            <div>
                                <p><strong>${item.name}</strong></p>
                                <p>GP ${item.price.toFixed(2)}</p>
                                ${stockWarning}
                                <div class="quantity-controls">
                                    <button class="decrease-quantity" data-id="${item.id}">-</button>
                                    <span class="quantity">${item.quantity}</span>
                                    <button class="increase-quantity" data-id="${item.id}" 
                                            ${item.outOfStock || (Number.isFinite(item.currentStock) && item.quantity >= item.currentStock) ? 'disabled' : ''}>+</button>
                                </div>
                                <button data-id="${item.id}" class="remove-item">Remove</button>
                            </div>
                        </div>
                    `;
                }).join('');
            
            // Disable checkout if any items are out of stock
            if (checkoutButton) {
                checkoutButton.disabled = hasOutOfStockItems;
                if (hasOutOfStockItems) {
                    checkoutButton.textContent = 'Remove out-of-stock items first';
                    checkoutButton.classList.add('disabled');
                } else {
                    checkoutButton.textContent = 'Checkout';
                    checkoutButton.classList.remove('disabled');
                }
            }
        } else {
            cartItemsContainer.innerHTML = '<p class="empty-message">Your cart is empty!</p>';
            if (checkoutButton) {
                checkoutButton.disabled = true;
                checkoutButton.textContent = 'Checkout';
                checkoutButton.classList.add('disabled');
            }
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

// Refresh cart inventory and clamp quantities to available stock
async function refreshCartInventory() {
    const cart = loadCart();
    if (cart.length === 0) return;
    
    try {
        const productIds = cart.map(item => item.id);
        const inventory = await fetch(`/api/inventory?ids=${encodeURIComponent(productIds.join(','))}`, { cache: 'no-store' })
            .then(res => res.json());
        
        let cartChanged = false;
        
        // Check each cart item against current stock
        cart.forEach(item => {
            const rec = inventory[item.id];
            const finite = rec && Number.isFinite(rec.stock);
            const oos = rec?.outOfStock || (finite && rec.stock === 0);
            
            if (oos) {
                // Mark item as out of stock for UI
                item.outOfStock = true;
            } else if (finite && rec.stock < item.quantity) {
                // Clamp quantity to available stock
                item.quantity = rec.stock;
                cartChanged = true;
            } else {
                // Item is available
                delete item.outOfStock;
            }
            
            // Store current stock for UI display
            item.currentStock = finite ? rec.stock : Infinity;
        });
        
        if (cartChanged) {
            saveCart(cart);
            updateCartCount();
        }
        
        updateCartUI();
        
    } catch (error) {
        console.error('Failed to refresh cart inventory:', error);
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
