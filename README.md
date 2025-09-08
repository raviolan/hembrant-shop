# Hembrant Shop - D&D Fantasy Webshop with Inventory Management

A static D&D-themed e-commerce site with persistent inventory management using Netlify Functions and Blob Storage.

## Features

### Core Functionality
- **Product Catalog**: 40+ fantasy-themed items (scrolls, apparel, familiar accessories, magical items)
- **Shopping Cart**: Persistent localStorage-based cart with real-time updates
- **Inventory Management**: Server-side stock tracking with out-of-stock prevention
- **Responsive Design**: Mobile-friendly with hamburger navigation
- **Category Filtering**: Organized product browsing by type

### Inventory System
- **Real-time Stock Checking**: Always fetches fresh inventory data
- **Purchase Validation**: Blocks checkout if items are out of stock
- **Stock Displays**: Shows "X left" for low stock, "Out of stock" badges
- **Cart Updates**: Automatically adjusts quantities when stock changes
- **DM Admin Panel**: Hidden inventory management interface

### Performance Optimizations
- Lazy loading images with `loading="lazy"`
- Font preconnection for faster loading
- DOM fragment rendering to avoid layout thrashing
- No-cache headers for inventory data freshness

## Project Structure

```
hembrant-shop/
├── hembrant-shop.html          # Homepage
├── products.html               # Product detail page
├── checkout.html              # Checkout form
├── confirmation.html          # Order confirmation
├── categories/                # Category listing pages
│   ├── shop-all.html
│   ├── apparel.html
│   ├── familiar.html
│   ├── items.html
│   └── scrolls.html
├── js/                        # Client-side JavaScript
│   ├── cart.js               # Cart management
│   ├── hembrant-shop.js      # Homepage logic
│   ├── category.js           # Category page logic
│   ├── shop-all.js          # Shop all page logic
│   ├── products.js          # Product detail logic
│   ├── checkout.js          # Checkout with purchase API
│   ├── inventory-utils.js   # Shared inventory helpers
│   └── admin.js             # DM admin panel
├── css/                      # Stylesheets
│   ├── base.css             # Global styles
│   ├── stock.css            # Inventory-related styling
│   └── [other CSS files]
├── netlify/functions/        # Serverless API
│   ├── _blob.js             # Shared blob storage helper
│   ├── inventory-get.js     # GET inventory endpoint
│   ├── inventory-set.js     # POST inventory update (admin)
│   └── purchase.js          # POST purchase processing
├── products.json            # Product data
├── _redirects              # Netlify routing
└── package.json           # Dependencies
```

## API Endpoints

### GET `/api/inventory`
Returns current inventory state for all products or specific IDs.

**Query Parameters:**
- `ids` (optional): Comma-separated product IDs to filter

**Response:**
```json
{
  "1": { "stock": 5, "outOfStock": false },
  "2": { "stock": 0, "outOfStock": true },
  "3": { "stock": "Infinity", "outOfStock": false }
}
```

### POST `/api/inventory/set`
Admin-only endpoint to update inventory. Requires `x-admin-token` header.

**Request:**
```json
{
  "id": "1",
  "stock": 10,
  "outOfStock": false
}
```

**Response:**
```json
{ "stock": 10, "outOfStock": false }
```

### POST `/api/purchase`
Process purchase and decrement inventory.

**Request:**
```json
{
  "items": [
    { "id": "1", "qty": 2 },
    { "id": "2", "qty": 1 }
  ]
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "inventory": {
    "1": { "stock": 3, "outOfStock": false },
    "2": { "stock": 0, "outOfStock": true }
  }
}
```

**Stock Error Response (409):**
```json
{
  "ok": false,
  "failures": [
    { "id": "2", "reason": "outOfStock", "stock": 0 },
    { "id": "3", "reason": "insufficient", "stock": 1 }
  ]
}
```

## Deployment Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Deploy to Netlify

#### Option A: Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy
netlify deploy --prod
```

#### Option B: Git Integration
1. Push code to GitHub/GitLab
2. Connect repository to Netlify
3. Set build command: `npm run build` (optional)
4. Set publish directory: `.` (root)

### 3. Set Environment Variables
In Netlify dashboard → Site settings → Environment variables:

```
ADMIN_TOKEN=your-secret-admin-token-here
```

Choose a strong, random token for admin access.

### 4. Verify Deployment
- Visit your site URL
- Test product browsing and cart functionality  
- Try checkout process
- Verify inventory updates persist across sessions

## Admin Usage

### Accessing DM Panel
1. Navigate to your homepage: `https://yoursite.com/?dm=1`
2. Enter your admin token when prompted
3. View/edit inventory in the popup table

### Managing Inventory
- **Stock**: Enter numbers for finite stock, leave blank for unlimited
- **Out of Stock**: Check to manually mark items unavailable
- **Save**: Click save button for each modified product
- **Refresh**: Reload inventory data from server

### Seeding Initial Inventory
You can also use the API directly to set up initial stock:

```bash
curl -X POST https://yoursite.com/.netlify/functions/inventory-set \
  -H "Content-Type: application/json" \
  -H "x-admin-token: your-secret-token" \
  -d '{"id": "1", "stock": 10, "outOfStock": false}'
```

## Technical Details

### Inventory Data Storage
- Uses Netlify Blob Storage with key `inventory.json`
- Data format: `{ "productId": { "stock": number, "outOfStock": boolean } }`
- Missing products default to unlimited stock

### Cache Prevention
- All inventory API calls use `{ cache: 'no-store' }`
- Server responses include `Cache-Control: no-store`
- Ensures real-time stock synchronization

### Error Handling
- Graceful fallback when inventory service unavailable
- Client-side validation before purchase attempts
- Clear user messaging for stock conflicts
- Automatic cart quantity adjustment

### Security
- Admin token validation for inventory modifications
- No sensitive data exposure in client code
- Purchase validation prevents overselling

## Development

### Local Development
```bash
# Start Netlify dev server
netlify dev

# Build for production (optional minification)
npm run build
```

### Testing Inventory System
1. Set some products to low stock (≤10) via admin panel
2. Set some products to out of stock
3. Add items to cart and verify stock badges appear
4. Try purchasing more than available stock
5. Verify cart updates and checkout prevention

### Customization
- Modify `products.json` to add/edit products
- Update styling in CSS files
- Extend inventory API in `netlify/functions/`
- Add new product categories by following existing patterns

## Performance Characteristics

- **First Load**: ~2-3s (images, fonts, initial inventory fetch)
- **Navigation**: ~500ms (cached resources, fresh inventory)
- **Cart Operations**: ~200ms (localStorage + inventory validation)
- **Purchase**: ~1-2s (API call + redirect)

## Browser Support
- Modern browsers (ES2018+ features used)
- Chrome 63+, Firefox 55+, Safari 11+
- Mobile responsive design

---

Built with vanilla HTML/CSS/JavaScript and Netlify Functions for reliable, fast performance.