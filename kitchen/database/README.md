# Database CSV - Google Sheets Import Guide

## Files (import each as a separate Sheet tab)

| File | Sheet Tab Name | Primary Key | Description |
|------|---------------|-------------|-------------|
| `categories.csv` | Categories | category_id | Master categories (ผัด, ทอด, ต้ม, ยำ, ของหวาน, นึ่ง, ปิ้ง/ย่าง...) |
| `products.csv` | Products | product_id | Menu items - linked to Categories via category_id |
| `users.csv` | Users | user_id | Customers + admin |
| `orders.csv` | Orders | order_id | Order header (customer, total, status) |
| `order_items.csv` | OrderItems | order_item_id | Order line items - linked to Orders + Products |

## Relationship
```
Categories 1--* Products
Users 1--* Orders
Orders 1--* OrderItems
Products 1--* OrderItems
```

## How to Import to Google Sheets

1. Open Google Sheets > Create Blank Spreadsheet (name: Secret Kitchen DB)
2. For each CSV: File > Import > Upload > Select CSV > `Replace current sheet` or `Create new sheet` > Separator: Comma > Convert text to numbers/dates: Yes
3. Rename tabs to: Categories, Products, Users, Orders, OrderItems
4. Set column formats:
   - price, cost, total, unit_price, line_total = Currency (THB)
   - stock, quantity = Number
   - created_at, updated_at = Date/Time
   - status, role = Plain text

## Notes
- All files are UTF-8 with Thai support. If Thai shows as ???, re-import with UTF-8 encoding.
- `products.csv` uses `category_id` (CAT01-CAT10) instead of free-text category - matches `inferCategory()` in `JS/utils.js` + `CATEGORY_MAP` in `JS/config.js`
- `users.csv` password_hash is placeholder - replace with real hash from Apps Script `register` action
- `orders.csv` + `order_items.csv` replaces the old `items: JSON.stringify(cart)` single-field design - now queryable per-item
- Keep `product_id` format P001, `order_id` format ORD-YYYYMMDD-XXX for sorting

## JS Modules (split from app.js)
```
JS/config.js      — SCRIPT_URL, DB_MAP (database/*.csv -> Sheets tabs), CATEGORY_MAP, globals
JS/utils.js       — getProductField(), inferCategory()
JS/navigation.js  — showPage(), window.onload
JS/products.js    — fetchProducts(), filter/sort/render
JS/auth.js        — registerUser(), login(), checkLoginState(), logout()
JS/modal.js       — openOrderModal(), generateModalOptions(), updateModalPrice(), confirmAddToCart()
JS/cart.js        — updateCartCount(), renderCart(), changeQty(), removeFromCart()
JS/checkout.js    — renderCheckout(), submitOrder()
JS/admin.js       — addProduct(), switchAdminTab(), fetchOrders(), fetchUsers()
JS/app.js         — legacy shim (keeps old cached pages working, does nothing if modules loaded)
```
Load order in `index.html` matters: `config.js` first, `app.js` last.

## Apps Script Sheet Setup
Create 5 sheets with exact tab names above, then set header row 1 from CSV first line. Apps Script actions map to:
- GET / -> read Products sheet
- action=register -> append Users
- action=login -> query Users
- action=addProduct -> append Products
- action=saveOrder -> append Orders + OrderItems (split items array)
- action=getOrders -> read Orders
- action=getUsers -> read Users
