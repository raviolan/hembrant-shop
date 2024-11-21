async function loadCategory(categoryName) {
    try {
        const response = await fetch('../products.json');
        const products = await response.json();

        // Filter products by category
        const filteredProducts = products.filter(product => product.category === categoryName);

        // Render the products dynamically
        const categoryGrid = document.querySelector('.category-grid');
        categoryGrid.innerHTML = filteredProducts
            .map(product => `
                <div class="product-item">
                    <img class="main-product-img" src="${product.mainImage}" alt="${product.name}">
                    <img class="hover-product-img" src="${product.hoverImage}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>GP ${product.price.toFixed(2)}</p>
                </div>
            `)
            .join('');

        // Add swipe functionality
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
                if (touchendX < touchstartX) {
                    // Swipe Left (show hover image)
                    item.querySelector('.main-product-img').style.display = 'none';
                    item.querySelector('.hover-product-img').style.display = 'block';
                }
                if (touchendX > touchstartX) {
                    // Swipe Right (show main image)
                    item.querySelector('.main-product-img').style.display = 'block';
                    item.querySelector('.hover-product-img').style.display = 'none';
                }
            }
        });
    } catch (error) {
        console.error("Error loading category:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const categoryName = document.querySelector('main').dataset.category;
    loadCategory(categoryName);
});
