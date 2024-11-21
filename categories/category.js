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
    setupEventListeners(); // Ensure event listeners are set after dynamic content is loaded
}

// Function to set up event listeners for dynamically included components
function setupEventListeners() {
    const navbarToggle = document.getElementById('navbarToggle');
    const cartDrawer = document.querySelector('.cart-drawer');
    const cartButton = document.querySelector('.cart-button');
    const closeCartButton = document.querySelector('.close-cart-button');

    // Navbar toggle functionality
    if (navbarToggle) {
        navbarToggle.addEventListener('click', () => {
            document.querySelector('.navbar').classList.toggle('active');
        });
    }

    // Cart drawer functionality
    if (cartButton && cartDrawer && closeCartButton) {
        cartButton.addEventListener('click', () => {
            cartDrawer.classList.add('open');
        });
        closeCartButton.addEventListener('click', () => {
            cartDrawer.classList.remove('open');
        });
    }
}

// Function to load and display category-specific products
async function loadCategory(categoryName) {
    try {
        const response = await fetch('../products.json');
        const products = await response.json();

        // Filter products by category
        const filteredProducts = products.filter(product => product.category === categoryName);

        // Render the products dynamically
        const categoryGrid = document.querySelector('.category-grid');
        if (categoryGrid) {
            categoryGrid.innerHTML = filteredProducts
                .map(product => `
                    <div class="product-item">
                        <div class="product-image-wrapper">
                            <img class="main-product-img" src="${product.mainImage}" alt="${product.name}">
                            <img class="hover-product-img" src="${product.hoverImage}" alt="${product.name}">
                        </div>
                        <h3>${product.name}</h3>
                        <p>GP ${product.price.toFixed(2)}</p>
                    </div>
                `)
                .join('');
        }

        // Add swipe functionality for mobile devices
        addSwipeFunctionality();
    } catch (error) {
        console.error("Error loading category:", error);
    }
}

// Function to add swipe functionality for product images
function addSwipeFunctionality() {
    const productItems = document.querySelectorAll('.product-item');

    productItems.forEach(item => {
        let touchstartX = 0;
        let touchendX = 0;

        item.addEventListener('touchstart', (e) => {
            touchstartX = e.changedTouches[0].screenX;
        });

        item.addEventListener('touchend', (e) => {
            touchendX = e.changedTouches[0].screenX;
            handleSwipe(item);
        });

        function handleSwipe(item) {
            const mainImage = item.querySelector('.main-product-img');
            const hoverImage = item.querySelector('.hover-product-img');

            if (!mainImage || !hoverImage) return;

            if (touchendX < touchstartX) {
                // Swipe Left (show hover image)
                mainImage.style.display = 'none';
                hoverImage.style.display = 'block';
            }
            if (touchendX > touchstartX) {
                // Swipe Right (show main image)
                mainImage.style.display = 'block';
                hoverImage.style.display = 'none';
            }
        }
    });
}

// Initialize the page on DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
    // Include HTML components
    await includeHTML();

    // Check if a category is defined and load products if applicable
    const categoryElement = document.querySelector('main[data-category]');
    if (categoryElement) {
        const categoryName = categoryElement.dataset.category;
        loadCategory(categoryName);
    }
});
