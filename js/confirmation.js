emailjs.init('bAKiavnTiK7BBCinY'); // Replace with your EmailJS public key

// Parse query parameters
const params = new URLSearchParams(window.location.search);

// Extract form data
const orderDetails = {
    name: params.get('name'), // Hero's Name
    party: params.get('party'), // Party Affiliation
    address: params.get('address'), // Current Lair/Location
    'delivery-method': params.get('delivery-method'), // Delivery Method
    'delivery-notes': params.get('delivery-notes'), // Additional Delivery Notes
    'gold-pouch-verification': params.get('gold-pouch-verification') ? 'Yes' : 'No', // Gold Pouch Verification
};

// Retrieve cart items from localStorage
const cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartDetails = cart.map(item => `${item.name} (x${item.quantity}) - GP ${(item.price * item.quantity).toFixed(2)}`).join('\n');

// Add cart details to the email payload
orderDetails.cart = cartDetails;

// Debugging: Log the order details to ensure correctness
console.log('Order Details:', orderDetails);

// Send email using EmailJS
emailjs.send('service_l4vz69y', 'template_qg3r1mq', orderDetails)
    .then(function (response) {
        console.log('Email sent successfully!', response.status, response.text);
    })
    .catch(function (error) {
        console.error('Failed to send email:', error);
    });



// Optionally display order details on the confirmation page
document.body.innerHTML += `
 <section class="cart-details">
        <h2>Items Ordered</h2>
        <div class="cart-grid">
            ${cart.map(item => `
                <div class="cart-item">
                    <img src="${item.mainImage}" alt="${item.name}" class="cart-item-image">
                    <div>
                        <p><strong>${item.name}</strong></p>
                        <p>Quantity: ${item.quantity}</p>
                        <p>Price: GP ${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    </section>
  <section class="order-details">    
<h2>Order Details</h2>
    <p><strong>Hero's Name:</strong> ${orderDetails.name}</p>
    <p><strong>Party:</strong> ${orderDetails.party}</p>
    <p><strong>Location:</strong> ${orderDetails.address}</p>
    <p><strong>Delivery Method:</strong> ${orderDetails['delivery-method']}</p>
    <p><strong>Delivery Notes:</strong> ${orderDetails['delivery-notes']}</p>
    <p><strong>Gold Pouch Verified:</strong> ${orderDetails['gold-pouch-verification']}</p>
     </section>
     
`;


// Clear the cart
localStorage.removeItem("cart");
