document.addEventListener("DOMContentLoaded", () => {
    const cartItemsContainer = document.querySelector(".cart-items");
    const subtotalElement = document.getElementById("subtotal");
    const totalElement = document.getElementById("total");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Save updated cart to localStorage
    function saveCart(updatedCart) {
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    }

    // Render cart items
    function renderCartItems() {
        if (cart.length > 0) {
            cartItemsContainer.innerHTML = cart
                .map(item => `
                <div class="cart-item">
                    <img src="${item.mainImage}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-content">
                        <span class="cart-item-name">${item.name}</span>
                        <input type="number" class="cart-item-quantity" value="${item.quantity}" min="1" data-id="${item.id}">
                        <button class="remove-item" data-id="${item.id}">Remove</button>
                    </div>
                    <span class="cart-item-price">GP ${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join("");
            attachCartListeners(); // Attach event listeners after rendering items
        } else {
            cartItemsContainer.innerHTML = "<p>Your cart is empty!</p>";
        }
    }

    // Attach event listeners to quantity inputs and remove buttons
    function attachCartListeners() {
        // Attach listeners for quantity change
        document.querySelectorAll(".cart-item-quantity").forEach(input => {
            input.addEventListener("change", (e) => {
                const productId = e.target.getAttribute("data-id");
                const newQuantity = parseInt(e.target.value, 10);
                if (!isNaN(newQuantity)) {
                    updateItemQuantity(productId, newQuantity);
                }
            });
        });

        // Attach listeners for remove button
        document.querySelectorAll(".remove-item").forEach(button => {
            button.addEventListener("click", (e) => {
                const productId = e.target.getAttribute("data-id");
                console.log(`Remove button clicked for product ID: ${productId}`);
                updateItemQuantity(productId, 0); // Remove item by setting quantity to 0
            });
        });
    }

    // Update item quantity or remove item
    function updateItemQuantity(productId, newQuantity) {
        const productIndex = cart.findIndex(item => item.id == productId); // Use `==` for type flexibility

        if (productIndex !== -1) {
            if (newQuantity > 0) {
                cart[productIndex].quantity = newQuantity;
            } else {
                cart.splice(productIndex, 1); // Remove item if quantity is 0
            }
            saveCart(cart); // Save updated cart to storage
        }

        renderCartItems(); // Refresh UI after updating the cart
        calculateTotals(); // Recalculate totals
    }

    // Calculate totals
    function calculateTotals() {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        subtotalElement.textContent = `GP ${subtotal.toFixed(2)}`;
        totalElement.textContent = `GP ${subtotal.toFixed(2)}`;
    }

    // Initialize the page
    renderCartItems();
    calculateTotals();
    setupFormSubmission();
});

// Setup form submission with purchase API
function setupFormSubmission() {
    const form = document.getElementById('checkout-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
        
        try {
            // Call purchase API
            const items = cart.map(({ id, quantity }) => ({ id: id.toString(), qty: quantity }));
            const response = await fetch('/api/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
                body: JSON.stringify({ items })
            });
            
            const data = await response.json();
            
            if (response.status === 200 && data.ok) {
                // Purchase successful - clear cart and redirect
                localStorage.removeItem('cart');
                
                // Redirect with form data as originally intended
                const formData = new FormData(form);
                const params = new URLSearchParams(formData).toString();
                window.location.href = `${form.action}?${params}`;
                
            } else if (response.status === 409) {
                // Stock insufficient - show errors and update cart
                showStockErrors(data.failures);
                
                // Update cart quantities based on available stock
                updateCartFromStockFailures(data.failures);
                
            } else {
                throw new Error(data.error || 'Purchase failed');
            }
            
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Shopkeeper is unavailable—try again in a moment.');
        } finally {
            // Restore button state
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// Show stock error messages to user
function showStockErrors(failures) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'stock-errors';
    errorDiv.innerHTML = `
        <h3>Some items are no longer available:</h3>
        <ul>
            ${failures.map(f => {
                if (f.reason === 'outOfStock') {
                    return `<li><strong>${f.id}</strong> is out of stock</li>`;
                } else {
                    return `<li><strong>${f.id}</strong> - only ${f.stock} available</li>`;
                }
            }).join('')}
        </ul>
        <p>Your cart has been updated. Please review and try again.</p>
    `;
    
    // Remove any existing error messages
    const existingErrors = document.querySelector('.stock-errors');
    if (existingErrors) {
        existingErrors.remove();
    }
    
    // Insert at top of form
    const form = document.getElementById('checkout-form');
    form.insertBefore(errorDiv, form.firstChild);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 10000);
}

// Update cart based on stock failures
function updateCartFromStockFailures(failures) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartChanged = false;
    
    failures.forEach(failure => {
        const itemIndex = cart.findIndex(item => item.id.toString() === failure.id);
        if (itemIndex !== -1) {
            if (failure.reason === 'outOfStock') {
                // Remove out of stock items
                cart.splice(itemIndex, 1);
                cartChanged = true;
            } else if (failure.reason === 'insufficient') {
                // Clamp to available stock
                cart[itemIndex].quantity = failure.stock;
                cartChanged = true;
            }
        }
    });
    
    if (cartChanged) {
        localStorage.setItem("cart", JSON.stringify(cart));
        // Refresh the checkout page display
        renderCartItems();
        calculateTotals();
    }
}

// Apply discount (placeholder)
const discountInput = document.getElementById("apply-discount");
discountInput.addEventListener("click", () => {
    alert("Discounts coming soon!"); // Add real logic here
});

