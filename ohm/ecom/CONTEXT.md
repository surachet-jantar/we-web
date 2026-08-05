# LCG SHOP — Domain Model

## Project Overview

**LCG SHOP** is a bilingual (Thai/English) e-commerce website specializing in **projector products only**. Built as a university assignment, it uses Google Sheets as a database and Google Drive for image storage. The site is built with HTML5, CSS3, and vanilla JavaScript — no frameworks.

---

## Ubiquitous Language

| Term | Definition |
|------|-----------|
| **Product** | A projector available for sale. Has technical specs, pricing, stock, and images. |
| **User** | A registered customer who can browse, add to cart, and checkout. |
| **Admin** | The single store owner. Has all customer capabilities plus product/order management. |
| **Cart** | A temporary selection of products stored in the browser (localStorage). Cleared after checkout. |
| **Order** | A completed purchase record. Contains customer info, items, total price, and status. |
| **Checkout** | The process of converting a cart into an order by providing name, phone, and address. |
| **Localization** | Switching the UI between Thai and English via a toggle. Product data is stored in both languages. |
| **Google Sheets** | The database. Stores Users, Products, and Orders in separate tabs. |
| **Google Drive** | Image hosting. Product images are uploaded here and displayed on the site via public URLs. |

---

## Entities

### User
| Field | Type | Notes |
|-------|------|-------|
| ID | string | Unique identifier |
| Name | string | Display name |
| Email | string | Login credential (unique) |
| Password | string | Hashed password |
| Phone | string | Contact number |
| Role | string | `"user"` or `"admin"` |
| CreatedAt | date | Registration date |

### Product
| Field | Type | Notes |
|-------|------|-------|
| ID | string | Unique identifier |
| Name_TH | string | Thai product name |
| Name_EN | string | English product name |
| Brand | string | e.g., Epson, BenQ, Sony |
| Resolution | string | e.g., 1080p, 4K UHD |
| Lumens | number | Brightness rating |
| ThrowType | string | Standard / Short Throw / Ultra Short Throw |
| Connectivity | string | e.g., HDMI, WiFi, USB-C |
| ContrastRatio | string | e.g., 100000:1 |
| RegularPrice | number | Original price (THB) |
| SalePrice | number | Discounted price (optional) |
| Stock | number | Available units |
| Description_TH | string | Thai description |
| Description_EN | string | English description |
| ImageURLs | array | Google Drive URLs (2-4 images) |
| CreatedAt | date | Creation date |

### Order
| Field | Type | Notes |
|-------|------|-------|
| ID | string | Unique identifier |
| UserID | string | Reference to User |
| Items | JSON | Array of {ProductID, Quantity, Price} |
| TotalPrice | number | Sum of all item prices |
| Name | string | Customer name |
| Phone | string | Customer phone |
| Address | string | Delivery address |
| Status | string | `"pending"` / `"shipped"` / `"delivered"` |
| CreatedAt | date | Order date |

---

## Roles & Permissions

| Capability | Guest | Customer | Admin |
|-----------|-------|----------|-------|
| Browse products | ✅ | ✅ | ✅ |
| Search/filter | ✅ | ✅ | ✅ |
| Register/Login | ✅ | ✅ | ✅ |
| Add to cart | ❌ | ✅ | ✅ |
| Checkout | ❌ | ✅ | ✅ |
| View order history | ❌ | ✅ | ✅ |
| Manage products (CRUD) | ❌ | ❌ | ✅ |
| Manage orders | ❌ | ❌ | ✅ |
| View all users | ❌ | ❌ | ✅ |
| Upload/delete Drive images | ❌ | ❌ | ✅ |

---

## Key Flows

### Product Management (Admin)
1. Admin opens `/admin` dashboard
2. Clicks "Add Product" → fills form (bilingual names, specs, pricing, stock)
3. Uploads 2-4 images → images go to Google Drive
4. Drive URLs + product data saved to Google Sheets
5. Product appears on the storefront

### Shopping & Checkout (Customer)
1. Customer browses/filters products on the storefront
2. Clicks "Add to Cart" → item saved to localStorage
3. Views cart, adjusts quantities, sees total price
4. Clicks "Checkout" → fills name, phone, address
5. Order recorded in Google Sheets
6. Shows "Thank You" confirmation page
7. Cart is cleared

### Localization
1. User clicks 🇹🇭/🇬🇧 toggle in navbar
2. JavaScript switches displayed columns (Name_TH ↔ Name_EN, etc.)
3. Language preference saved to localStorage
4. Page re-renders instantly (no reload)

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Database | Google Sheets API |
| Image Storage | Google Drive API |
| Icons | Font Awesome (CDN) |
| Placeholder Images | Unsplash |
| Hosting | Static files (dist folder) |

---

## Architectural Decisions

### ADR-001: Google Sheets as Database
- **Decision**: Use Google Sheets instead of a traditional database.
- **Rationale**: Free, no server setup, easy for a school project. The Sheets API provides CRUD operations via JavaScript.
- **Trade-off**: Limited query capabilities, slower than SQL, no relational integrity. Acceptable for this scope.

### ADR-002: localStorage for Cart
- **Decision**: Store shopping cart in browser localStorage.
- **Rationale**: Simplifies the backend. Cart only becomes an Order at checkout.
- **Trade-off**: Cart is lost if user clears browser data. Acceptable for a demo/school project.

### ADR-003: Single-Page Application (SPA)
- **Decision**: Use SPA routing (hash-based) with a single `index.html`.
- **Rationale**: Smooth UX without page reloads. Cleaner deployment.
- **Trade-off**: Slightly more complex JavaScript routing. Worth it for the UX benefit.

### ADR-004: Bilingual Data in Sheets
- **Decision**: Store both Thai and English text in the same Sheet row.
- **Rationale**: The UI toggle simply switches which columns are displayed. No separate data sources needed.
- **Trade-off**: Wider sheets, but manageable with column naming convention (_TH / _EN).
