// Extract product ID from URL
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

if (productId) {
    Promise.all([
        fetch('/products.json').then(res => res.json()),
        fetch(`/api/inventory?ids=${encodeURIComponent(productId)}`, { cache: 'no-store' })
            .then(res => res.json())
            .catch(() => ({})) // Fallback if inventory service unavailable
    ]).then(([products, inventory]) => {
        const product = products.find(p => p.id == productId);
        if (product) {
            renderProductDetails(product, inventory[productId]);
            renderRelatedProducts(products, product.category, productId);
        } else {
            document.getElementById('product-details').innerHTML = '<p>Product not found!</p>';
        }
    }).catch(err => {
        console.error("Error loading products:", err);
        document.getElementById('product-details').innerHTML = '<p>Error loading product details.</p>';
    });
} else {
    document.getElementById('product-details').innerHTML = '<p>Invalid product ID.</p>';
}

// Function to render product details
function renderProductDetails(product, inventoryRec = null) {
    const productDetails = document.getElementById('product-details');
    
    // Check stock state
    const rec = inventoryRec || {};
    const finite = Number.isFinite(rec.stock);
    const oos = rec.outOfStock || (finite && rec.stock === 0);
    const lowStock = finite && rec.stock <= 10 && rec.stock > 0;
    
    // Debug logging
    console.log(`Product ${product.id}:`, {
        hasInventoryRec: !!inventoryRec,
        rec: rec,
        finite: finite,
        oos: oos,
        lowStock: lowStock
    });

    // Collect all images: main, hover, and extra images dynamically
    const galleryImages = [product.mainImage, product.hoverImage]
        .concat(
            Object.keys(product)
                .filter(key => key.startsWith('extraImage')) // Find keys like extraImage1, extraImage2
                .map(key => product[key])
        )
        .filter(Boolean); // Filter out undefined or null values

    const thumbnails = galleryImages.map((image, index) => `
        <img 
            src="${image}" 
            class="product-thumbnail ${index === 0 ? 'active' : ''}" 
            data-image="${image}" 
            onclick="updateMainImage('${image}', this)"
            loading="lazy">
    `).join('');

    const stockLabel = oos ? 'Out of stock' : (lowStock ? `${rec.stock} left` : '');
    const buttonText = oos ? 'Out of Stock' : 'Add to Cart';
    const buttonDisabled = oos ? 'disabled' : '';
    const buttonClass = oos ? 'disabled' : '';
    
    // Show stock count for items with less than 3 in stock (but not out of stock)
    const showStockCount = finite && rec.stock < 3 && rec.stock > 0;
    const stockCountText = showStockCount ? `Only ${rec.stock} in stock` : '';
    
    // Debug the stock count logic
    console.log(`Product ${product.id} stock count:`, {
        finite: finite,
        stock: rec.stock,
        lessThan3: rec.stock < 3,
        greaterThan0: rec.stock > 0,
        showStockCount: showStockCount,
        stockCountText: stockCountText
    });

    productDetails.innerHTML = `
        <div class="product-image-gallery">
            <img 
                src="${product.mainImage}" 
                alt="${product.name}" 
                id="main-product-image" 
                class="product-main-image">
            <div class="product-thumbnails">
                ${thumbnails}
            </div>
        </div>
        <div class="product-detail-container">
            <h1>${product.name}</h1>
            <p>${product.description}</p>
            <p><strong>Price:</strong> GP ${product.price.toFixed(2)}</p>
            ${stockLabel ? `<p class="stock-info ${oos ? 'out-of-stock' : 'low-stock'}">${stockLabel}</p>` : ''}
            <button onclick='addToCart(${JSON.stringify(product)})' ${buttonDisabled} class="${buttonClass}">${buttonText}</button>
            ${stockCountText ? `<p class="low-stock-notice">${stockCountText}</p>` : ''}
        </div>
    `;

    // Attach hover functionality to all thumbnails
    const mainImage = document.getElementById('main-product-image');
    document.querySelectorAll('.product-thumbnail').forEach(thumbnail => {
        thumbnail.addEventListener('mouseover', () => {
            const hoverImage = thumbnail.getAttribute('data-image');
            mainImage.src = hoverImage;
        });
        thumbnail.addEventListener('mouseout', () => {
            // Restore the active thumbnail's image
            const activeThumbnail = document.querySelector('.product-thumbnail.active');
            if (activeThumbnail) {
                mainImage.src = activeThumbnail.getAttribute('data-image');
            }
        });
    });
}

// Function to update main image
function updateMainImage(imageUrl, thumbnailElement) {
    const mainImage = document.getElementById('main-product-image');
    mainImage.src = imageUrl;

    // Highlight the active thumbnail
    document.querySelectorAll('.product-thumbnail').forEach(thumbnail => {
        thumbnail.classList.remove('active');
    });
    thumbnailElement.classList.add('active');
}

// Function to render related products
function renderRelatedProducts(products, category, productId) {
    const relatedProducts = products.filter(p => p.category === category && p.id != productId).slice(0, 4);
    const grid = document.querySelector('.related-products-grid');
    grid.innerHTML = relatedProducts.map(product => `
        <div class="related-product-card">
            <a href="/products.html?id=${product.id}">
                <img src="${product.mainImage}" alt="${product.name}">
                <h3>${product.name}</h3>
            </a>
        </div>
    `).join('');
}