/**
 * ============================================================
 * LCG SHOP — Quick Setup (Sheets Only)
 * ============================================================
 * 
 * Run this function FIRST to create the sheet tabs with headers.
 * Then import the CSV files from docs/sample-data/ into each tab.
 * ============================================================
 */

const SHEET_USERS    = 'Users';
const SHEET_PRODUCTS = 'Products';
const SHEET_ORDERS   = 'Orders';

function quickSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Users
  if (!ss.getSheetByName(SHEET_USERS)) {
    ss.insertSheet(SHEET_USERS).appendRow(
      ['ID', 'Name', 'Email', 'Password', 'Phone', 'Role', 'CreatedAt']
    );
    Logger.log('✅ Created: Users sheet');
  } else {
    Logger.log('⏭️ Users sheet already exists');
  }

  // Products
  if (!ss.getSheetByName(SHEET_PRODUCTS)) {
    ss.insertSheet(SHEET_PRODUCTS).appendRow([
      'ID', 'Name_TH', 'Name_EN', 'Brand', 'Resolution', 'Lumens',
      'ThrowType', 'Connectivity', 'ContrastRatio', 'RegularPrice',
      'SalePrice', 'Stock', 'Description_TH', 'Description_EN',
      'ImageURLs', 'CreatedAt'
    ]);
    Logger.log('✅ Created: Products sheet');
  } else {
    Logger.log('⏭️ Products sheet already exists');
  }

  // Orders
  if (!ss.getSheetByName(SHEET_ORDERS)) {
    ss.insertSheet(SHEET_ORDERS).appendRow(
      ['ID', 'UserID', 'Items', 'TotalPrice', 'Name', 'Phone', 'Address', 'Status', 'CreatedAt']
    );
    Logger.log('✅ Created: Orders sheet');
  } else {
    Logger.log('⏭️ Orders sheet already exists');
  }

  // Delete default Sheet1
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
    Logger.log('🗑️ Deleted: Sheet1');
  }

  Logger.log('');
  Logger.log('✅ Setup complete!');
  Logger.log('📄 Now import the CSV files from docs/sample-data/:');
  Logger.log('   - Users.csv → Users tab');
  Logger.log('   - Products.csv → Products tab');
  Logger.log('   - Orders.csv → Orders tab');
  Logger.log('');
  Logger.log('📧 Default admin: admin@lcgshop.com / admin123');
}
