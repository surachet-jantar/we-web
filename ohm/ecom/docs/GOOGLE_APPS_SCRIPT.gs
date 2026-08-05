/**
 * LCG SHOP — Google Apps Script Backend
 * 
 * SETUP:
 * 1. Create Google Sheet "LCG_Shop_DB" with tabs: Users, Products, Orders
 * 2. Import CSV files from docs/sample-data/ into each tab
 * 3. Extensions → Apps Script → paste this file → Save
 * 4. Deploy → Web app → Execute as: Me → Anyone → Copy URL
 * 5. Paste URL into js/config.js as API_URL
 */

const SHEET_USERS    = 'Users';
const SHEET_PRODUCTS = 'Products';
const SHEET_ORDERS   = 'Orders';

function doOptions(e) {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}

// ====== GET ======
function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  switch (action) {
    case 'getProducts':     return json(getAll(ss, SHEET_PRODUCTS));
    case 'getProduct':      return json(findById(ss, SHEET_PRODUCTS, e.parameter.id));
    case 'getUsers':        return json(getAll(ss, SHEET_USERS));
    case 'getUser':         return json(findById(ss, SHEET_USERS, e.parameter.id));
    case 'getOrders':       return json(getAll(ss, SHEET_ORDERS));
    case 'getOrdersByUser': return json(byField(ss, SHEET_ORDERS, 'UserID', e.parameter.userId));
    case 'getOrder':        return json(findById(ss, SHEET_ORDERS, e.parameter.id));
    default:                return json({ error: 'Unknown action: ' + action });
  }
}

// ====== POST ======
function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    switch (d.action) {
      case 'addUser':      return json(add(ss, SHEET_USERS, d.row));
      case 'updateUser':   return json(update(ss, SHEET_USERS, d.id, d.row));
      case 'addProduct':   return json(add(ss, SHEET_PRODUCTS, d.row));
      case 'updateProduct':return json(update(ss, SHEET_PRODUCTS, d.id, d.row));
      case 'deleteProduct':return json(remove(ss, SHEET_PRODUCTS, d.id));
      case 'addOrder':     return json(add(ss, SHEET_ORDERS, d.row));
      case 'updateOrder':  return json(update(ss, SHEET_ORDERS, d.id, d.row));
      case 'uploadImage':  return json(uploadImage(d));
      default:             return json({ error: 'Unknown action: ' + d.action });
    }
  } catch (err) {
    return json({ error: err.message });
  }
}

// ====== READ HELPERS ======
function getAll(ss, name) {
  const ws = ss.getSheetByName(name);
  if (!ws) return { rows: [], total: 0 };
  const data = ws.getDataRange().getValues();
  if (data.length <= 1) return { rows: [], total: 0 };
  const headers = data[0].map(String);
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    let ok = false;
    headers.forEach((h, j) => { if (h) { row[h] = data[i][j]; if (data[i][j]) ok = true; } });
    if (ok && row.ID) {
      if (row.ImageURLs && typeof row.ImageURLs === 'string') {
        try { row.ImageURLs = JSON.parse(row.ImageURLs); } catch(e) { row.ImageURLs = []; }
      }
      rows.push(row);
    }
  }
  return { rows, total: rows.length };
}

function findById(ss, name, id) {
  const r = getAll(ss, name);
  const row = r.rows.find(x => String(x.ID) === String(id));
  return row ? { row } : { row: null };
}

function byField(ss, name, field, val) {
  const r = getAll(ss, name);
  return { rows: r.rows.filter(x => String(x[field]) === String(val)) };
}

// ====== WRITE HELPERS ======
function add(ss, name, data) {
  const ws = ss.getSheetByName(name);
  if (!ws) return { error: name + ' not found' };
  const headers = ws.getRange(1, 1, 1, ws.getLastColumn()).getValues()[0].map(String);
  ws.appendRow(headers.map(h => typeof data[h] === 'object' ? JSON.stringify(data[h]) : (data[h] || '')));
  return { success: true };
}

function update(ss, name, id, data) {
  const ws = ss.getSheetByName(name);
  if (!ws) return { error: name + ' not found' };
  const all = ws.getDataRange().getValues();
  const headers = all[0].map(String);
  const idCol = headers.indexOf('ID');
  for (let i = 1; i < all.length; i++) {
    if (String(all[i][idCol]) === String(id)) {
      const row = headers.map((h, j) => data[h] !== undefined ? (typeof data[h] === 'object' ? JSON.stringify(data[h]) : data[h]) : all[i][j]);
      ws.getRange(i + 1, 1, 1, headers.length).setValues([row]);
      return { success: true };
    }
  }
  return { error: 'Not found: ' + id };
}

function remove(ss, name, id) {
  const ws = ss.getSheetByName(name);
  if (!ws) return { error: name + ' not found' };
  const all = ws.getDataRange().getValues();
  const idCol = all[0].map(String).indexOf('ID');
  for (let i = 1; i < all.length; i++) {
    if (String(all[i][idCol]) === String(id)) { ws.deleteRow(i + 1); return { success: true }; }
  }
  return { error: 'Not found: ' + id };
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

// ====== IMAGE UPLOAD ======
// Stores images in the Drive folder configured via SHEET_PRODUCTS Drive ID.
// Change FOLDER_ID to match your Google Drive folder.
const FOLDER_ID = 'YOUR_FOLDER_ID_HERE';

function uploadImage(data) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const blob = Utilities.newBlob(
      Utilities.base64Decode(data.base64),
      data.mimeType,
      data.fileName
    );
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const fileId = file.getId();
    const url = 'https://drive.google.com/uc?export=view&id=' + fileId;
    return { success: true, url: url, fileId: fileId };
  } catch (err) {
    return { error: err.message };
  }
}
