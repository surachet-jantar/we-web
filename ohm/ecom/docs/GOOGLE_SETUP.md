# Google Services Setup Guide — LCG SHOP

This guide walks you through setting up Google Sheets (database) for the LCG SHOP website using Google Apps Script as a backend.

---

## Quick Start (5 minutes)

### Step 1: Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com) → **Blank spreadsheet**
2. Name it: **`LCG_Shop_DB`**

### Step 2: Add Apps Script
1. Click **Extensions** → **Apps Script**
2. Delete any existing code
3. Copy the entire content from `docs/GOOGLE_APPS_SCRIPT.gs` and paste it
4. Click **Save** (💾)

### Step 3: Run Setup
1. In the Apps Script editor, select `setupSampleData` from the function dropdown
2. Click **Run** (▶)
3. Authorize when prompted (Google will ask for permissions)
4. Go back to your spreadsheet — you'll see 3 tabs with data!

### Step 4: Deploy
1. In Apps Script, click **Deploy** → **New deployment**
2. Click ⚙ gear icon → **Web app**
3. Description: `LCG SHOP API`
4. Execute as: **Me**
5. Who has access: **Anyone**
6. Click **Deploy**
7. **Copy the Web App URL**

### Step 5: Configure Website
Edit `js/config.js`:
```javascript
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
  DRIVE_FOLDER_ID: '',
  DEFAULT_LANG: 'th',
  ADMIN_EMAIL: 'admin@lcgshop.com'
};
```

### Step 6: Test
Open `index.html` in a browser — products should appear!

---

## Default Admin Account
| Field | Value |
|-------|-------|
| Email | `admin@lcgshop.com` |
| Password | `admin123` |

> ⚠️ Change the admin email in `js/config.js` to your own email!

---

## Sheet Structure

### Users Tab
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| ID | Name | Email | Password | Phone | Role | CreatedAt |

### Products Tab
| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ID | Name_TH | Name_EN | Brand | Resolution | Lumens | ThrowType | Connectivity | ContrastRatio | RegularPrice | SalePrice | Stock | Description_TH | Description_EN | ImageURLs | CreatedAt |

### Orders Tab
| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| ID | UserID | Items | TotalPrice | Name | Phone | Address | Status | CreatedAt |

---

## Available API Actions

### GET (via URL parameters)
| Action | URL | Description |
|--------|-----|-------------|
| `getProducts` | `?action=getProducts` | Get all products |
| `getProduct` | `?action=getProduct&id=PRD_001` | Get single product |
| `getUsers` | `?action=getUsers` | Get all users |
| `getOrders` | `?action=getOrders` | Get all orders |
| `getOrdersByUser` | `?action=getOrdersByUser&userId=USR_001` | Get user's orders |

### POST (via request body)
| Action | Body | Description |
|--------|------|-------------|
| `addUser` | `{action:'addUser', row:{...}}` | Register new user |
| `addProduct` | `{action:'addProduct', row:{...}}` | Add new product |
| `updateProduct` | `{action:'updateProduct', id:'PRD_001', row:{...}}` | Edit product |
| `deleteProduct` | `{action:'deleteProduct', id:'PRD_001'}` | Delete product |
| `addOrder` | `{action:'addOrder', row:{...}}` | Place order |
| `updateOrder` | `{action:'updateOrder', id:'ORD_001', row:{{Status:'shipped'}}}` | Update order |

---

## Sample Products (added by setup)
| ID | Brand | Resolution | Price |
|----|-------|-----------|-------|
| PRD_001 | BenQ | 4K UHD | ฿29,900 |
| PRD_002 | Epson | 1080p | ฿17,900 |
| PRD_003 | Sony | 4K UHD | ฿129,000 |
| PRD_004 | XGIMI | 4K UHD | ฿24,900 |
| PRD_005 | Epson | 4K UHD | ฿26,900 |
| PRD_006 | BenQ | 1080p | ฿19,900 |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error | Make sure Apps Script is deployed as "Web app" with "Anyone" access |
| "Sheet not found" | Run `setupSampleData()` function in Apps Script editor |
| 403 Forbidden | Re-deploy the script after any code changes |
| Empty products | Check `config.js` has the correct API_URL |
| Password wrong | Passwords are SHA-256 hashed — use `setupSampleData()` to create admin |

---

## How to Re-deploy After Changes

1. Go to Apps Script → **Deploy** → **Manage deployments**
2. Click ✏️ **Edit** (pencil icon)
3. Select **New version**
4. Click **Deploy**

---

## Security Notes

1. **Apps Script** acts as a proxy — raw Google Sheets is not exposed
2. **Passwords** are SHA-256 hashed before storing
3. **Admin** identified by email in config
4. **Google Sheets** is free and works for school projects

> ⚠️ **Known Limitation**: Google Sheets is not a production database. For a real e-commerce site, use PostgreSQL or MongoDB. This approach is perfect for university assignments.
