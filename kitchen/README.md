# ครัวลับ Secret Kitchen — อาหารโฮมเมดเดลิเวอรี่

Static storefront for a homemade food delivery shop. Browse menus, customize orders, manage cart/checkout, and handle admin operations via Google Apps Script backend.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Bootstrap 5](https://img.shields.io/badge/Bootstrap-7952B3?logo=bootstrap&logoColor=white)

## ✨ Features

- **Menu browsing** — cards with image, price, stock badge, category badge
- **Menu filter** — live search by name/detail/category, category dropdown (auto-populated), sort by price / name / stock, result count + clear button
- **Order customization modal** — meat choice, add-ons (+price), free notes, custom note, quantity, live total
- **Cart** — quantity +/- , remove, grand total, persisted in `localStorage` (`secret_kitchen_cart`)
- **Checkout** — customer name/phone/address, order summary, `saveOrder` to Apps Script
- **Auth** — register / login / logout, role-based nav (`admin` shows Admin tab)
- **Admin** — add product (image upload as base64), view orders, view users
- **Branding** — `IMG/Icon.ico` used as favicon, shortcut icon, apple-touch-icon, and navbar logo

## 🧱 Tech Stack

- HTML / CSS / Vanilla JS
- [Bootstrap 5.3](https://getbootstrap.com/) (CDN)
- Google Apps Script Web App as API (`SCRIPT_URL` in `JS/app.js`)

## 📁 Project Structure

```
secret_kitchen/
├── index.html          # All pages as sections (home, cart, checkout, login, register, admin)
├── CSS/
│   └── style.css       # Card hover, product image, badges, filter bar, header logo
├── JS/
│   └── app.js          # Fetch products, filter/sort, modal, cart, checkout, auth, admin
├── IMG/
│   └── Icon.ico        # Favicon + header logo
├── README.md
└── .gitignore
```

## 🚀 Getting Started

No build step required.

1. Clone:
   ```bash
   git clone <your-repo-url>
   cd secret_kitchen
   ```
2. Configure backend (see below).
3. Open `index.html` directly or serve locally:
   ```bash
   # Python
   python -m http.server 8000
   # or VS Code Live Server extension
   ```
4. Visit `http://localhost:8000`.

## ⚙️ Configuration

Edit `JS/app.js`:

```js
const SCRIPT_URL = 'https://script.google.com/macros/s/.../exec';
```

Deploy your Google Apps Script as **Web App** (Anyone with the link) and paste the URL. Expected actions: `register`, `login`, `addProduct`, `saveOrder`, `getOrders`, `getUsers`, and default `GET` returning product list.

## 🔍 Menu Filter

- `menu-search` — filters by product name, detail, or inferred category
- `menu-category-filter` — populated from `inferCategory()` (ผัด, ทอด, ต้ม/แกง, ยำ/ส้มตำ, ข้าว, เส้น, อื่นๆ) or explicit `category` field
- `menu-sort` — `default` | `price-asc` | `price-desc` | `name-asc` | `stock-desc`
- `clearMenuFilter()` resets all controls

## 🛒 Cart Storage

```js
localStorage.getItem('secret_kitchen_cart')
// [{ id, name, price, image, quantity, options }]
```

## 🔐 Roles

- `localStorage.userRole` — `admin` unlocks Admin nav + tabs
- `localStorage.userName` — display name

## 📝 License

MIT — do what you want, keep the notice.
