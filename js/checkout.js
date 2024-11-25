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
            attachCartListeners();
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
                updateItemQuantity(productId, 0); // Remove item by setting quantity to 0
            });
        });
    }


    // Update item quantity or remove item
    function updateItemQuantity(productId, newQuantity) {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const productIndex = cart.findIndex(item => item.id == productId); // Use `==` for type flexibility

        if (productIndex !== -1) {
            if (newQuantity > 0) {
                cart[productIndex].quantity = newQuantity;
            } else {
                cart.splice(productIndex, 1); // Remove item if quantity is 0
            }
            localStorage.setItem("cart", JSON.stringify(cart)); // Save updated cart to storage
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

    renderCartItems();
    calculateTotals();
});


// Apply discount (placeholder)
discountInput.addEventListener("click", () => {
    alert("Discounts coming soon!"); // Add real logic here
});

// Handle form submission
const form = document.getElementById("checkout-form");
form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Order placed! Thank you for shopping.");
    localStorage.removeItem("cart"); // Clear the cart
    window.location.href = "/"; // Redirect to the home page
});

renderCartItems();
calculateTotals();
console.log(`Remove button clicked for product ID: ${productId}`);
