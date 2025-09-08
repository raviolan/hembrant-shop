// DM Admin Panel for inventory management
// Activated via ?dm=1 query parameter

let adminToken = null;

// Check if admin panel should be shown
function initAdminPanel() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('dm') === '1') {
        showAdminPanel();
    }
}

// Show admin panel UI
async function showAdminPanel() {
    // Check if token is already stored
    adminToken = sessionStorage.getItem('admin-token');
    
    if (!adminToken) {
        adminToken = prompt('Enter admin token:');
        if (!adminToken) return;
        sessionStorage.setItem('admin-token', adminToken);
    }
    
    // Create admin panel UI
    const adminPanel = document.createElement('div');
    adminPanel.id = 'admin-panel';
    adminPanel.innerHTML = `
        <div class="admin-overlay">
            <div class="admin-content">
                <h2>DM Inventory Panel</h2>
                <div class="admin-controls">
                    <button id="refresh-inventory">Refresh</button>
                    <button id="close-admin">Close</button>
                </div>
                <div id="admin-inventory-table">
                    <p>Loading...</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(adminPanel);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .admin-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        }
        .admin-content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            width: 90%;
        }
        .admin-controls {
            margin-bottom: 20px;
        }
        .admin-controls button {
            margin-right: 10px;
            padding: 8px 16px;
            background: #007cba;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .admin-controls button:hover {
            background: #005a87;
        }
        .admin-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .admin-table th, .admin-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .admin-table th {
            background-color: #f2f2f2;
        }
        .admin-table input[type="number"] {
            width: 80px;
        }
        .admin-table input[type="checkbox"] {
            transform: scale(1.2);
        }
        .admin-save-btn {
            padding: 4px 8px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }
        .admin-save-btn:hover {
            background: #218838;
        }
        .admin-error {
            color: red;
            font-size: 14px;
        }
        .admin-success {
            color: green;
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);
    
    // Setup event listeners
    document.getElementById('close-admin').onclick = () => {
        adminPanel.remove();
        style.remove();
    };
    
    document.getElementById('refresh-inventory').onclick = loadAdminInventory;
    
    // Load initial data
    await loadAdminInventory();
}

// Load and display inventory in admin table
async function loadAdminInventory() {
    try {
        const [products, inventory] = await Promise.all([
            fetch('/products.json').then(res => res.json()),
            fetch('/api/inventory', { cache: 'no-store' }).then(res => res.json())
        ]);
        
        const tableContainer = document.getElementById('admin-inventory-table');
        
        const table = document.createElement('table');
        table.className = 'admin-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Product ID</th>
                    <th>Name</th>
                    <th>Stock</th>
                    <th>Out of Stock</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => {
                    const inv = inventory[product.id] || { stock: Infinity, outOfStock: false };
                    const stockValue = Number.isFinite(inv.stock) ? inv.stock : '';
                    const stockPlaceholder = Number.isFinite(inv.stock) ? '' : 'Unlimited';
                    
                    return `
                        <tr data-product-id="${product.id}">
                            <td>${product.id}</td>
                            <td>${product.name}</td>
                            <td>
                                <input type="number" 
                                       class="stock-input" 
                                       value="${stockValue}" 
                                       placeholder="${stockPlaceholder}"
                                       min="0">
                            </td>
                            <td>
                                <input type="checkbox" 
                                       class="oos-checkbox" 
                                       ${inv.outOfStock ? 'checked' : ''}>
                            </td>
                            <td>
                                <button class="admin-save-btn" onclick="saveProduct('${product.id}')">Save</button>
                                <span class="save-status"></span>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;
        
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
        
    } catch (error) {
        console.error('Failed to load admin inventory:', error);
        document.getElementById('admin-inventory-table').innerHTML = 
            '<p class="admin-error">Failed to load inventory. Check your admin token.</p>';
    }
}

// Save individual product inventory
async function saveProduct(productId) {
    const row = document.querySelector(`tr[data-product-id="${productId}"]`);
    const stockInput = row.querySelector('.stock-input');
    const oosCheckbox = row.querySelector('.oos-checkbox');
    const statusSpan = row.querySelector('.save-status');
    
    const stockValue = stockInput.value.trim();
    const stock = stockValue === '' ? Infinity : parseInt(stockValue, 10);
    const outOfStock = oosCheckbox.checked;
    
    if (stockValue !== '' && (isNaN(stock) || stock < 0)) {
        statusSpan.textContent = '❌ Invalid stock number';
        statusSpan.className = 'save-status admin-error';
        return;
    }
    
    try {
        const response = await fetch('/api/inventory/set', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-token': adminToken
            },
            cache: 'no-store',
            body: JSON.stringify({
                id: productId,
                stock: Number.isFinite(stock) ? stock : undefined,
                outOfStock: outOfStock
            })
        });
        
        if (response.status === 401) {
            sessionStorage.removeItem('admin-token');
            statusSpan.textContent = '❌ Invalid token';
            statusSpan.className = 'save-status admin-error';
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        statusSpan.textContent = '✅ Saved';
        statusSpan.className = 'save-status admin-success';
        
        // Clear status after 3 seconds
        setTimeout(() => {
            statusSpan.textContent = '';
        }, 3000);
        
    } catch (error) {
        console.error('Save failed:', error);
        statusSpan.textContent = '❌ Save failed';
        statusSpan.className = 'save-status admin-error';
    }
}

// Make saveProduct globally available
window.saveProduct = saveProduct;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initAdminPanel);