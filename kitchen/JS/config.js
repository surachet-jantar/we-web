// ==========================================
// Config — Google Apps Script + Database Map
// ==========================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxCnlffB72CIk5qXI_VhDKduqISPsOATTOpHF_vpA8PfXKtyA__VCQTIQVEIY_S9ABGgQ/exec';

// Database files (database/*.csv) -> Google Sheets tabs
// categories.csv  -> Categories  (PK: category_id)
// products.csv    -> Products    (PK: product_id, FK: category_id)
// users.csv       -> Users       (PK: user_id)
// orders.csv      -> Orders      (PK: order_id, FK: user_email)
// order_items.csv -> OrderItems  (PK: order_item_id, FK: order_id, product_id)
const DB_MAP = {
    categories: 'database/categories.csv',
    products: 'database/products.csv',
    users: 'database/users.csv',
    orders: 'database/orders.csv',
    order_items: 'database/order_items.csv',
};

const CATEGORY_MAP = {
    'CAT01': 'ผัด', 'CAT02': 'ทอด', 'CAT03': 'ต้ม', 'CAT04': 'ยำ',
    'CAT05': 'ข้าว', 'CAT06': 'เส้น', 'CAT07': 'อื่นๆ',
    'CAT08': 'ของหวาน', 'CAT09': 'นึ่ง', 'CAT10': 'ปิ้ง/ย่าง'
};

let allProducts = [];
let currentModalProduct = null;
let currentModalQty = 1;
