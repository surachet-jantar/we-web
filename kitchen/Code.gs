/**
 * Secret Kitchen — Google Apps Script backend
 * Maps to: database/categories.csv, products.csv, users.csv, orders.csv, order_items.csv
 * Frontend modules: JS/config.js (DB_MAP, CATEGORY_MAP), utils.js, products.js, auth.js, modal.js, cart.js, checkout.js, admin.js
 *
 * Setup:
 * 1. Create Google Sheet with 5 tabs: Categories, Products, Users, Orders, OrderItems
 * 2. Copy headers from database/*.csv row 1 into each tab row 1
 * 3. Paste this file as Code.gs in Apps Script, deploy as Web App (Anyone with link)
 * 4. Copy Web App URL into JS/config.js SCRIPT_URL
 */

// Sheet names must match database/*.csv -> tab names
const SHEETS = {
  categories: 'Categories',
  products: 'Products',
  users: 'Users',
  orders: 'Orders',
  order_items: 'OrderItems'
};

const HEADERS = {
  categories: ['category_id','category_name','category_name_th','description','icon'],
  products: ['product_id','name','price','cost','stock','detail','image_url','category_id','status','is_recommended','created_at','updated_at'],
  users: ['user_id','email','username','name','password_hash','role','phone','created_at'],
  orders: ['order_id','user_email','customer_name','phone','address','total','status','payment_status','created_at'],
  order_items: ['order_item_id','order_id','product_id','product_name','unit_price','quantity','options','line_total']
};

// Optional: Drive folder for product images (create folder and paste ID, or leave '' to skip Drive upload)
const DRIVE_FOLDER_ID = ''; // e.g. '1AbC...'

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

function ensureHeaders(sheetName, headers) {
  const sh = getSheet(sheetName);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
}

function setupSheets() {
  ensureHeaders(SHEETS.categories, HEADERS.categories);
  ensureHeaders(SHEETS.products, HEADERS.products);
  ensureHeaders(SHEETS.users, HEADERS.users);
  ensureHeaders(SHEETS.orders, HEADERS.orders);
  ensureHeaders(SHEETS.order_items, HEADERS.order_items);
}

function sheetToObjects(sheetName) {
  const sh = getSheet(sheetName);
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2) return [];
  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const rows = sh.getRange(2, 1, lastRow - 1, lastCol).getValues();
  return rows.map(r => {
    const o = {};
    headers.forEach((h, i) => o[h] = r[i]);
    return o;
  });
}

function appendRow(sheetName, obj, headers) {
  const sh = getSheet(sheetName);
  const row = headers.map(h => obj[h] !== undefined ? obj[h] : '');
  sh.appendRow(row);
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// CORS preflight
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || '';
    if (action === 'getOrders') {
      const orders = sheetToObjects(SHEETS.orders);
      // newest first
      orders.reverse();
      return jsonResponse(orders.map(o => ({
        orderId: o.order_id,
        order_id: o.order_id,
        name: o.customer_name,
        customer_name: o.customer_name,
        total: o.total,
        status: o.status,
        payment_status: o.payment_status,
        created_at: o.created_at
      })));
    }
    if (action === 'getUsers') {
      const users = sheetToObjects(SHEETS.users);
      return jsonResponse(users.map(u => ({
        email: u.email,
        username: u.username,
        name: u.name,
        role: u.role,
        phone: u.phone,
        user_id: u.user_id
      })));
    }
    if (action === 'getCategories') {
      return jsonResponse(sheetToObjects(SHEETS.categories));
    }
    // default: return products (for JS/products.js fetchProducts)
    const products = sheetToObjects(SHEETS.products).filter(p => String(p.status).toLowerCase() !== 'inactive');
    // Map to frontend expected keys (both snake and camel, plus id alias)
    const mapped = products.map(p => ({
      product_id: p.product_id,
      id: p.product_id,
      ID: p.product_id,
      name: p.name,
      Name: p.name,
      price: Number(p.price) || 0,
      Price: Number(p.price) || 0,
      cost: Number(p.cost) || 0,
      stock: Number(p.stock) || 0,
      Stock: Number(p.stock) || 0,
      detail: p.detail,
      Detail: p.detail,
      image: p.image_url,
      Image: p.image_url,
      image_url: p.image_url,
      category_id: p.category_id,
      category: p.category_id,
      Category: p.category_id,
      status: p.status,
      is_recommended: p.is_recommended,
      created_at: p.created_at,
      updated_at: p.updated_at
    }));
    return jsonResponse(mapped);
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  }
}

function doPost(e) {
  try {
    const body = e.postData ? e.postData.contents : '';
    const data = body ? JSON.parse(body) : (e.parameter || {});
    const action = data.action || '';

    if (action === 'register') {
      return handleRegister(data);
    }
    if (action === 'login') {
      return handleLogin(data);
    }
    if (action === 'addProduct') {
      return handleAddProduct(data);
    }
    if (action === 'saveOrder') {
      return handleSaveOrder(data);
    }
    return jsonResponse({ status: 'error', message: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  }
}

function handleRegister(data) {
  const email = String(data.email || '').trim().toLowerCase();
  const username = String(data.username || '').trim();
  const name = String(data.name || '').trim();
  const password = String(data.password || '');
  if (!email || !username || !password || !name) {
    return jsonResponse({ status: 'error', message: 'Missing fields' });
  }
  const users = sheetToObjects(SHEETS.users);
  if (users.some(u => String(u.email).toLowerCase() === email)) {
    return jsonResponse({ status: 'exists_email' });
  }
  if (users.some(u => String(u.username).toLowerCase() === username.toLowerCase())) {
    return jsonResponse({ status: 'exists_username' });
  }
  const userId = 'U' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHHmmss');
  // NOTE: For demo, store plain hash placeholder. Replace with proper hash in production.
  const hash = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)).slice(0, 32);
  appendRow(SHEETS.users, {
    user_id: userId,
    email: email,
    username: username,
    name: name,
    password_hash: hash,
    role: 'customer',
    phone: '',
    created_at: new Date()
  }, HEADERS.users);
  return jsonResponse({ status: 'success', user_id: userId });
}

function handleLogin(data) {
  const email = String(data.email || '').trim().toLowerCase();
  const password = String(data.password || '');
  const hash = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)).slice(0, 32);
  const users = sheetToObjects(SHEETS.users);
  const user = users.find(u => String(u.email).toLowerCase() === email && String(u.password_hash) === hash);
  // Fallback: allow plain password match for legacy rows where password_hash was stored as plain
  const fallback = !user ? users.find(u => String(u.email).toLowerCase() === email && String(u.password_hash) === password) : null;
  const found = user || fallback;
  if (found) {
    return jsonResponse({ status: 'ok', name: found.name, role: found.role, email: found.email });
  }
  return jsonResponse({ status: 'error', message: 'Invalid credentials' });
}

function handleAddProduct(data) {
  const name = String(data.name || '').trim();
  const price = Number(data.price) || 0;
  const stock = Number(data.stock) || 0;
  const detail = String(data.detail || '').trim();
  const categoryId = String(data.category_id || data.category || '').trim() || 'CAT07';
  if (!name || !price) return jsonResponse({ status: 'error', message: 'Missing name/price' });

  let imageUrl = String(data.image_url || data.imageUrl || '').trim();
  // If imageBase64 provided, upload to Drive
  if (data.imageBase64) {
    try {
      const blob = Utilities.newBlob(Utilities.base64Decode(data.imageBase64), data.imageType || 'image/jpeg', data.imageName || 'product.jpg');
      let folder = null;
      if (DRIVE_FOLDER_ID) folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
      const file = folder ? folder.createFile(blob) : DriveApp.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      imageUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();
    } catch (err) {
      // fallback to placeholder if upload fails
      imageUrl = 'https://via.placeholder.com/250?text=' + encodeURIComponent(name);
    }
  }
  if (!imageUrl) imageUrl = 'https://via.placeholder.com/250?text=' + encodeURIComponent(name);

  const products = sheetToObjects(SHEETS.products);
  const nextNum = products.length + 1;
  const productId = 'P' + String(nextNum).padStart(3, '0');
  const now = new Date();
  appendRow(SHEETS.products, {
    product_id: productId,
    name: name,
    price: price,
    cost: '',
    stock: stock,
    detail: detail,
    image_url: imageUrl,
    category_id: categoryId,
    status: 'active',
    is_recommended: 'FALSE',
    created_at: now,
    updated_at: now
  }, HEADERS.products);
  return jsonResponse({ status: 'success', product_id: productId, image_url: imageUrl });
}

function handleSaveOrder(data) {
  const orderId = String(data.orderId || data.order_id || 'ORD-' + Date.now()).trim();
  const customerName = String(data.name || data.customer_name || '').trim();
  const phone = String(data.phone || '').trim();
  const address = String(data.address || '').trim();
  const total = Number(data.total) || 0;
  let items = data.items;
  if (typeof items === 'string') {
    try { items = JSON.parse(items); } catch (e) { items = []; }
  }
  if (!Array.isArray(items)) items = [];
  if (!customerName || !phone || !address) {
    return jsonResponse({ status: 'error', message: 'Missing customer info' });
  }
  const now = new Date();
  // Orders sheet
  appendRow(SHEETS.orders, {
    order_id: orderId,
    user_email: String(data.email || data.user_email || '').trim(),
    customer_name: customerName,
    phone: phone,
    address: address,
    total: total,
    status: 'pending',
    payment_status: 'unpaid',
    created_at: now
  }, HEADERS.orders);

  // OrderItems sheet — one row per cart item
  items.forEach((item, idx) => {
    const lineTotal = Number(item.price) * Number(item.quantity);
    appendRow(SHEETS.order_items, {
      order_item_id: orderId + '-' + String(idx + 1).padStart(2, '0'),
      order_id: orderId,
      product_id: String(item.id || item.product_id || ''),
      product_name: String(item.name || ''),
      unit_price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      options: String(item.options || ''),
      line_total: lineTotal
    }, HEADERS.order_items);
  });

  // Optionally decrement stock
  try {
    const sh = getSheet(SHEETS.products);
    const lastRow = sh.getLastRow();
    if (lastRow >= 2) {
      const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
      const idCol = headers.indexOf('product_id') + 1;
      const stockCol = headers.indexOf('stock') + 1;
      if (idCol > 0 && stockCol > 0) {
        const idRange = sh.getRange(2, idCol, lastRow - 1, 1).getValues();
        items.forEach(item => {
          const pid = String(item.id || item.product_id || '');
          for (let r = 0; r < idRange.length; r++) {
            if (String(idRange[r][0]) === pid) {
              const cur = Number(sh.getRange(r + 2, stockCol).getValue()) || 0;
              sh.getRange(r + 2, stockCol).setValue(Math.max(0, cur - Number(item.quantity)));
              break;
            }
          }
        });
      }
    }
  } catch (e) { /* non-fatal */ }

  return jsonResponse({ status: 'success', orderId: orderId });
}
