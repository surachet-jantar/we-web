// ==========================================
// นำ Web App URL ที่ได้จาก Google Apps Script มาใส่ที่นี่ !!!
// ==========================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxvxX7gGQZPVipG0nHjnzSzluOirzDEpO8hvx5wCph7uoNQlGbECVpDQ2imR2_wQadP/exec';

// ระบบเปลี่ยนหน้า
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(el => el.classList.add('d-none'));
    document.getElementById('page-' + pageId).classList.remove('d-none');
    
    // ถ้าเปิดหน้า Checkout ให้โหลดข้อมูลรายการสรุปด้วย
    if (pageId === 'checkout') {
        renderCheckout();
    }
}

let allProducts = [];

window.onload = function() {
    fetchProducts();
    checkLoginState();
}

window.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    bindMenuFilterEvents();
});

function fetchProducts() {
    let productList = document.getElementById('product-list');
    productList.innerHTML = '<p class="text-center mt-5 text-muted">กำลังโหลดเมนูอาหาร...</p>';

    fetch(SCRIPT_URL)
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        allProducts = Array.isArray(data) ? data : [];
        if (!allProducts || allProducts.length === 0) {
            productList.innerHTML = '<p class="text-center text-muted mt-5">วันนี้ยังไม่มีเมนูอาหาร</p>';
            populateCategoryFilter([]);
            updateMenuFilterCount(0, 0);
            return;
        }
        populateCategoryFilter(allProducts);
        renderFilteredProducts();
        updateCartCount();
    })
    .catch(error => {
        console.error('Error fetching products:', error);
        productList.innerHTML = '<p class="text-center text-danger mt-5">ไม่สามารถโหลดเมนูได้ (ตรวจสอบการตั้งค่า Apps Script)</p>';
    });
}

// ===== Menu Filter Logic =====
function getProductField(p, keys, fallback) {
    for (let k of keys) if (p[k] !== undefined && p[k] !== null && p[k] !== '') return p[k];
    return fallback;
}
function inferCategory(p) {
    let cat = getProductField(p, ['category','Category','type','Type','group','Group'], '');
    if (cat) return String(cat).trim();
    let name = String(getProductField(p, ['name','Name'], '') + ' ' + getProductField(p, ['detail','Detail'], '')).toLowerCase();
    if (name.includes('กะเพรา') || name.includes('ผัด') || name.includes('คั่ว')) return 'ผัด';
    if (name.includes('ทอด') || name.includes('กรอบ')) return 'ทอด';
    if (name.includes('ต้ม') || name.includes('แกง') || name.includes('ซุป')) return 'ต้ม/แกง';
    if (name.includes('ยำ') || name.includes('ส้มตำ') || name.includes('ลาบ')) return 'ยำ/ส้มตำ';
    if (name.includes('ข้าว')) return 'ข้าว';
    if (name.includes('เส้น') || name.includes('ผัดไทย') || name.includes('ราดหน้า')) return 'เส้น';
    return 'อื่นๆ';
}
function populateCategoryFilter(products) {
    let sel = document.getElementById('menu-category-filter');
    if (!sel) return;
    let cats = [...new Set(products.map(inferCategory))].sort((a,b)=>a.localeCompare(b,'th'));
    let current = sel.value;
    sel.innerHTML = '<option value="">ทั้งหมด</option>' + cats.map(c=>`<option value="${c}">${c}</option>`).join('');
    if (cats.includes(current)) sel.value = current;
}
function getFilteredProducts() {
    let q = (document.getElementById('menu-search')?.value || '').trim().toLowerCase();
    let cat = document.getElementById('menu-category-filter')?.value || '';
    let sort = document.getElementById('menu-sort')?.value || 'default';
    let filtered = allProducts.filter(p => {
        let name = String(getProductField(p, ['name','Name'], '')).toLowerCase();
        let detail = String(getProductField(p, ['detail','Detail'], '')).toLowerCase();
        let category = inferCategory(p);
        let matchSearch = !q || name.includes(q) || detail.includes(q) || category.toLowerCase().includes(q);
        let matchCat = !cat || category === cat;
        return matchSearch && matchCat;
    });
    if (sort === 'price-asc') filtered.sort((a,b)=> Number(getProductField(a,['price','Price'],0)) - Number(getProductField(b,['price','Price'],0)));
    else if (sort === 'price-desc') filtered.sort((a,b)=> Number(getProductField(b,['price','Price'],0)) - Number(getProductField(a,['price','Price'],0)));
    else if (sort === 'name-asc') filtered.sort((a,b)=> String(getProductField(a,['name','Name'],'')).localeCompare(String(getProductField(b,['name','Name'],'')) , 'th'));
    else if (sort === 'stock-desc') filtered.sort((a,b)=> Number(getProductField(b,['stock','Stock'],0)) - Number(getProductField(a,['stock','Stock'],0)));
    return filtered;
}
function updateMenuFilterCount(shown, total) {
    let el = document.getElementById('menu-filter-count');
    if (!el) return;
    if (!total) el.textContent = '';
    else if (shown === total) el.textContent = `แสดง ${total} เมนู`;
    else el.textContent = `แสดง ${shown} จาก ${total} เมนู`;
}
function renderFilteredProducts() {
    let productList = document.getElementById('product-list');
    if (!productList) return;
    let filtered = getFilteredProducts();
    updateMenuFilterCount(filtered.length, allProducts.length);
    if (filtered.length === 0) {
        productList.innerHTML = `<div class="col-12 text-center py-5"><p class="text-muted mb-2">ไม่พบเมนูที่ตรงกับตัวกรอง 😢</p><button class="btn btn-sm btn-outline-warning" onclick="clearMenuFilter()">ล้างตัวกรอง</button></div>`;
        return;
    }
    let html = '';
    filtered.forEach(p => {
        let pId = getProductField(p, ['id','ID','product_id'], '');
        let pName = getProductField(p, ['name','Name'], 'ไม่มีชื่อเมนู');
        let pPrice = getProductField(p, ['price','Price'], 0);
        let pStock = getProductField(p, ['stock','Stock'], 0);
        let pImage = getProductField(p, ['image','Image'], 'https://via.placeholder.com/250');
        let pDetail = getProductField(p, ['detail','Detail'], 'ไม่มีรายละเอียด');
        let pCat = inferCategory(p);
        let formattedPrice = Number(pPrice).toLocaleString();
        let stockBadge = pStock > 0 ? `<span class="badge bg-success badge-custom">พร้อมเสิร์ฟ</span>` : `<span class="badge bg-danger badge-custom">วัตถุดิบหมด</span>`;
        let catBadge = `<span class="badge bg-dark bg-opacity-75 position-absolute" style="top:15px; right:15px; z-index:10; font-size:0.75rem;">${pCat}</span>`;
        html += `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm position-relative border-0">
                    ${stockBadge}
                    ${catBadge}
                    <img src="${pImage}" class="card-img-top product-img" alt="${pName}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold text-dark mb-1">${pName}</h5>
                        <p class="card-text text-muted small mb-2">${pDetail}</p>
                        <div class="mt-auto pt-3 border-top">
                            <h4 class="text-danger fw-bold mb-2">฿${formattedPrice}</h4>
                            <p class="text-secondary small mb-3">ทำได้อีก: ${pStock} ที่</p>
                            <button class="btn btn-warning w-100 fw-bold text-dark shadow-sm" onclick="openOrderModal('${pId}')" ${pStock <= 0 ? 'disabled' : ''}> 🛒 สั่งเมนูนี้</button>
                        </div>
                    </div>
                </div>
            </div>`;
    });
    productList.innerHTML = html;
}
function bindMenuFilterEvents() {
    let search = document.getElementById('menu-search');
    let cat = document.getElementById('menu-category-filter');
    let sort = document.getElementById('menu-sort');
    if (search) {
        search.addEventListener('input', renderFilteredProducts);
        search.addEventListener('keydown', (e)=> { if(e.key==='Enter') e.preventDefault(); });
    }
    if (cat) cat.addEventListener('change', renderFilteredProducts);
    if (sort) sort.addEventListener('change', renderFilteredProducts);
}
function clearMenuFilter() {
    let s = document.getElementById('menu-search');
    let c = document.getElementById('menu-category-filter');
    let so = document.getElementById('menu-sort');
    if (s) s.value = '';
    if (c) c.value = '';
    if (so) so.value = 'default';
    renderFilteredProducts();
}

function registerUser() {
    let emailInput = document.getElementById("reg-email").value.trim();
    let usernameInput = document.getElementById("reg-username").value.trim();
    let passwordInput = document.getElementById("reg-password").value.trim();
    let confirmPasswordInput = document.getElementById("reg-confirm-password").value.trim();
    let nameInput = document.getElementById("reg-name").value.trim();

    if (!emailInput || !usernameInput || !passwordInput || !confirmPasswordInput || !nameInput) {
        return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    }
    if (passwordInput !== confirmPasswordInput) {
        return alert("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน!");
    }
    if (!emailInput.includes('@')) {
        return alert("กรุณากรอกรูปแบบอีเมลให้ถูกต้อง");
    }

    let payload = { action: "register", email: emailInput, username: usernameInput, name: nameInput, password: passwordInput };

    let loadingModal = document.getElementById("loading-modal");
    if(loadingModal) loadingModal.style.display = "flex";

    fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) })
    .then(res => res.json())
    .then(response => {
        if(loadingModal) loadingModal.style.display = "none";
        if (response.status === "success") {
            alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
            document.getElementById("reg-email").value = "";
            document.getElementById("reg-username").value = "";
            document.getElementById("reg-password").value = "";
            document.getElementById("reg-confirm-password").value = "";
            document.getElementById("reg-name").value = "";
            showPage('login');
        } else if (response.status === "exists_email") {
            alert("อีเมลนี้มีผู้ใช้งานในระบบแล้ว!");
        } else if (response.status === "exists_username") {
            alert("ชื่อผู้ใช้นี้ (Username) ถูกใช้ไปแล้ว!");
        } else {
            alert("เกิดข้อผิดพลาดในการสมัครสมาชิก");
        }
    })
    .catch(error => {
        if(loadingModal) loadingModal.style.display = "none";
        console.error("Error:", error);
        alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    });
}

function login() {
    let e = document.getElementById('login-email').value.trim();
    let p = document.getElementById('login-password').value.trim();
    
    if (!e || !p) return alert("กรุณากรอกอีเมลและรหัสผ่าน");

    let loadingModal = document.getElementById("loading-modal");
    if(loadingModal) loadingModal.style.display = "flex";

    fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: "login", email: e, password: p }) })
    .then(res => res.json())
    .then(data => {
        if(loadingModal) loadingModal.style.display = "none";
        if(data.status === "ok") {
            alert("ยินดีต้อนรับคนหิว " + data.name + "!");
            localStorage.setItem("userRole", data.role);
            localStorage.setItem("userName", data.name);
            checkLoginState();
            showPage('home');
            location.reload(); 
        } else {
            alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง!");
        }
    })
    .catch(error => {
        if(loadingModal) loadingModal.style.display = "none";
        console.error("Login Error:", error);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อระบบเซิร์ฟเวอร์");
    });
}

function checkLoginState() {
    let role = localStorage.getItem("userRole");
    if(role) {
        document.getElementById('nav-login').classList.add('d-none');
        document.getElementById('nav-logout').classList.remove('d-none');
        if(role === 'admin') {
            document.getElementById('nav-admin').classList.remove('d-none');
        }
    }
}

function logout() {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    location.reload();
}

// ตะกร้าสินค้าเปลี่ยน Key เป็น secret_kitchen_cart
let currentModalProduct = null;
let currentModalQty = 1;

// เปิดหน้าต่าง Modal ตัวเลือกอาหาร
function openOrderModal(productId) {
    currentModalProduct = allProducts.find(p => p.id === productId || p.ID === productId || p.product_id === productId);
    if (!currentModalProduct) return;

    currentModalQty = 1;
    let productName = currentModalProduct.name || currentModalProduct.Name;

    // เซ็ตข้อความเริ่มต้น
    document.getElementById('modal-product-name').innerText = productName;
    document.getElementById('modal-product-price-base').innerText = Number(currentModalProduct.price || currentModalProduct.Price).toLocaleString();
    document.getElementById('modal-qty').innerText = currentModalQty;
    document.getElementById('modal-custom-note').value = '';

    // เรียกฟังก์ชันสร้างตัวเลือกตามชื่อเมนู
    generateModalOptions(productName);

    // ผูก Event ให้คำนวณราคาใหม่ทุกครั้งที่กดเปลี่ยนตัวเลือก
    document.querySelectorAll('.addon-option, .choice-option').forEach(el => {
        el.onchange = updateModalPrice;
    });

    updateModalPrice();

    let modalEl = document.getElementById('orderModal');
    let modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modalInstance.show();
}

// ฟังก์ชันสร้างตัวเลือกอัตโนมัติตามชื่ออาหาร
function generateModalOptions(name) {
    let choicesHtml = '';
    
    // เช็คว่าชื่อเมนูมีคำเหล่านี้หรือไม่ ถ้ามี ให้มีตัวเลือกเนื้อสัตว์
    if (name.includes('กะเพรา') || name.includes('ข้าวผัด') || name.includes('พริกแกง') || name.includes('ทอดกระเทียม') || name.includes('ผัดซีอิ๊ว')) {
        choicesHtml = `
            <h6 class="fw-bold text-primary border-bottom pb-2 mt-2">🥩 เลือกเนื้อสัตว์ (เลือก 1 อย่าง)</h6>
            <div class="form-check mb-2">
                <input class="form-check-input choice-option" type="radio" name="meat_choice" value="หมูสับ" data-price="0" id="c-pork" checked>
                <label class="form-check-label" for="c-pork">หมูสับ (ราคาปกติ)</label>
            </div>
            <div class="form-check mb-2">
                <input class="form-check-input choice-option" type="radio" name="meat_choice" value="ไก่ชิ้น" data-price="0" id="c-chicken">
                <label class="form-check-label" for="c-chicken">ไก่ชิ้น (ราคาปกติ)</label>
            </div>
            <div class="form-check mb-2">
                <input class="form-check-input choice-option" type="radio" name="meat_choice" value="หมูกรอบ" data-price="15" id="c-crispypork">
                <label class="form-check-label" for="c-crispypork">หมูกรอบ (+15 บาท)</label>
            </div>
            <div class="form-check mb-2">
                <input class="form-check-input choice-option" type="radio" name="meat_choice" value="ทะเล" data-price="20" id="c-seafood">
                <label class="form-check-label" for="c-seafood">ทะเล (กุ้ง+หมึก) (+20 บาท)</label>
            </div>
            <div class="form-check mb-2">
                <input class="form-check-input choice-option" type="radio" name="meat_choice" value="รวมมิตร" data-price="25" id="c-mixed">
                <label class="form-check-label" for="c-mixed">รวมมิตร (+25 บาท)</label>
            </div>
        `;
    }
    document.getElementById('modal-dynamic-choices').innerHTML = choicesHtml;

    // ตัวเลือกบวกเงินเพิ่ม (แสดงทุกเมนู)
    let addonsHtml = `
        <div class="form-check mb-2">
            <input class="form-check-input addon-option" type="checkbox" value="พิเศษ เพิ่มข้าว" data-price="10" id="a-rice">
            <label class="form-check-label" for="a-rice">พิเศษ เพิ่มข้าว (+10 บาท)</label>
        </div>
        <div class="form-check mb-2">
            <input class="form-check-input addon-option" type="checkbox" value="พิเศษ เพิ่มกับ" data-price="20" id="a-meat">
            <label class="form-check-label" for="a-meat">พิเศษ เพิ่มกับ (+20 บาท)</label>
        </div>
        <div class="form-check mb-2">
            <input class="form-check-input addon-option" type="checkbox" value="ไข่ดาว" data-price="10" id="a-egg1">
            <label class="form-check-label" for="a-egg1">เพิ่มไข่ดาว (+10 บาท)</label>
        </div>
        <div class="form-check mb-2">
            <input class="form-check-input addon-option" type="checkbox" value="ไข่เจียว" data-price="15" id="a-egg2">
            <label class="form-check-label" for="a-egg2">เพิ่มไข่เจียว (+15 บาท)</label>
        </div>
    `;
    document.getElementById('modal-dynamic-addons').innerHTML = addonsHtml;

    // หมายเหตุฟรี (แสดงทุกเมนู)
    let notesHtml = `
        <div class="form-check mb-2">
            <input class="form-check-input note-option" type="checkbox" value="ไม่ใส่ผัก" id="n-noveg">
            <label class="form-check-label" for="n-noveg">ไม่ใส่ผัก</label>
        </div>
        <div class="form-check mb-2">
            <input class="form-check-input note-option" type="checkbox" value="ทำเป็นกับข้าว" id="n-onlymeat">
            <label class="form-check-label" for="n-onlymeat">ทำเป็นกับข้าว (ไม่ราดข้าว)</label>
        </div>
        <div class="form-check mb-2">
            <input class="form-check-input note-option" type="checkbox" value="เผ็ดน้อย" id="n-lessspicy">
            <label class="form-check-label" for="n-lessspicy">เผ็ดน้อย</label>
        </div>
        <div class="form-check mb-2">
            <input class="form-check-input note-option" type="checkbox" value="เผ็ดมาก" id="n-morespicy">
            <label class="form-check-label" for="n-morespicy">เผ็ดจัด รสจัด</label>
        </div>
    `;
    document.getElementById('modal-dynamic-notes').innerHTML = notesHtml;
}

// คำนวณราคาในป็อปอัป
function updateModalPrice() {
    let basePrice = Number(currentModalProduct.price || currentModalProduct.Price);
    let addonPrice = 0;
    
    // ตรวจสอบราคาเนื้อสัตว์ (Radio)
    let choiceEl = document.querySelector('.choice-option:checked');
    if(choiceEl) {
        addonPrice += Number(choiceEl.getAttribute('data-price'));
    }

    // ตรวจสอบราคาที่บวกเพิ่มอื่นๆ (Checkbox)
    document.querySelectorAll('.addon-option:checked').forEach(cb => {
        addonPrice += Number(cb.getAttribute('data-price'));
    });

    let unitPrice = basePrice + addonPrice;
    let totalPrice = unitPrice * currentModalQty;
    document.getElementById('modal-total-price').innerText = totalPrice.toLocaleString();
}

// เปลี่ยนจำนวนในป็อปอัป
function changeModalQty(amount) {
    if (currentModalQty + amount >= 1) {
        currentModalQty += amount;
        document.getElementById('modal-qty').innerText = currentModalQty;
        updateModalPrice();
    }
}

// ยืนยันการสั่งลงตะกร้า (เก็บตัวเลือกทั้งหมดไปด้วย)
function confirmAddToCart() {
    if (!currentModalProduct) return;

    let selectedOptions = [];
    let addonPrice = 0;

    // 1. เก็บข้อมูล Radio (ถ้ามี)
    let choiceEl = document.querySelector('.choice-option:checked');
    if(choiceEl) {
        selectedOptions.push(choiceEl.value);
        addonPrice += Number(choiceEl.getAttribute('data-price'));
    }

    // 2. เก็บข้อมูล Checkbox ที่เสียเงิน
    document.querySelectorAll('.addon-option:checked').forEach(cb => {
        selectedOptions.push(cb.value);
        addonPrice += Number(cb.getAttribute('data-price'));
    });

    // 3. เก็บข้อมูล Checkbox ที่ฟรี
    document.querySelectorAll('.note-option:checked').forEach(cb => {
        selectedOptions.push(cb.value);
    });

    // 4. เก็บข้อความพิมพ์เอง
    let customNote = document.getElementById('modal-custom-note').value.trim();
    if (customNote) selectedOptions.push(customNote);

    let optionsString = selectedOptions.length > 0 ? selectedOptions.join(', ') : '';
    let finalUnitPrice = Number(currentModalProduct.price || currentModalProduct.Price) + addonPrice;

    let cart = JSON.parse(localStorage.getItem('secret_kitchen_cart')) || [];
    let pId = currentModalProduct.id || currentModalProduct.ID || currentModalProduct.product_id;
    
    // ตรวจสอบว่าสั่งออเดอร์เดิม + ตัวเลือกเป๊ะๆ เหมือนเดิมไหม จะได้ยุบรวมเป็นจำนวน (Qty) แทน
    let existingItemIndex = cart.findIndex(item => item.id === pId && item.options === optionsString);

    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += currentModalQty;
    } else {
        cart.push({
            id: pId,
            name: currentModalProduct.name || currentModalProduct.Name,
            price: finalUnitPrice, 
            image: currentModalProduct.image || currentModalProduct.Image,
            quantity: currentModalQty,
            options: optionsString
        });
    }

    localStorage.setItem('secret_kitchen_cart', JSON.stringify(cart));
    updateCartCount();

    let modalEl = document.getElementById('orderModal');
    let modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('secret_kitchen_cart')) || [];
    let totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').innerText = totalCount;
}

function renderCart() {
    let cart = JSON.parse(localStorage.getItem('secret_kitchen_cart')) || [];
    let html = '';
    let grandTotal = 0;

    if (cart.length === 0) {
        html = '<tr><td colspan="5" class="text-center text-muted py-4">คุณยังไม่ได้สั่งเมนูใดๆ 😢</td></tr>';
    } else {
        cart.forEach((item, index) => {
            let totalItemPrice = item.price * item.quantity;
            grandTotal += totalItemPrice;
            html += `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${item.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" class="me-3 shadow-sm">
                        <span class="fw-bold">${item.name}</span>
${item.options ? `<br><small class="text-danger fw-bold" style="font-size:0.8em;">(${item.options})</small>` : ''}
                    </div>
                </td>
                <td>฿${Number(item.price).toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${index}, -1)">-</button>
                    <span class="mx-2 fw-bold">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${index}, 1)">+</button>
                </td>
                <td class="text-danger fw-bold">฿${Number(totalItemPrice).toLocaleString()}</td>
                <td><button class="btn btn-sm btn-danger shadow-sm" onclick="removeFromCart(${index})">ลบ</button></td>
            </tr>`;
        });
    }

    document.getElementById('cart-table-body').innerHTML = html;
    document.getElementById('cart-total').innerText = grandTotal.toLocaleString();
}

function changeQty(index, amount) {
    let cart = JSON.parse(localStorage.getItem('secret_kitchen_cart')) || [];
    cart[index].quantity += amount;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    localStorage.setItem('secret_kitchen_cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('secret_kitchen_cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('secret_kitchen_cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

let originalShowPage = showPage;
showPage = function(pageId) {
    originalShowPage(pageId);
    if(pageId === 'cart') renderCart();
}

function renderCheckout() {
    let cart = JSON.parse(localStorage.getItem('secret_kitchen_cart')) || [];
    let html = '';
    let grandTotal = 0;

    cart.forEach(item => {
        let totalItemPrice = item.price * item.quantity;
        grandTotal += totalItemPrice;
        html += `
        <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent">
            <div>
                <h6 class="my-0 fw-bold">${item.name}</h6>
${item.options ? `<small class="text-danger fw-bold d-block" style="font-size:0.8em;">${item.options}</small>` : ''}
                <small class="text-muted">จำนวน: ${item.quantity} ที่</small>
            </div>
            <span class="text-dark fw-bold">฿${Number(totalItemPrice).toLocaleString()}</span>
        </li>`;
    });

    document.getElementById('checkout-item-list').innerHTML = html;
    document.getElementById('checkout-total').innerText = grandTotal.toLocaleString() + ' บาท';
}

function submitOrder() {
    let name = document.getElementById('chk-name').value.trim();
    let phone = document.getElementById('chk-phone').value.trim();
    let address = document.getElementById('chk-address').value.trim();
    let cart = JSON.parse(localStorage.getItem('secret_kitchen_cart')) || [];

    if (!name || !phone || !address) return alert('กรุณากรอกข้อมูลที่อยู่จัดส่งให้ครบถ้วนเพื่อความรวดเร็ว!');
    if (cart.length === 0) return alert('ไม่มีอาหารในตะกร้า');

    let grandTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let orderId = 'FOOD-' + Date.now();

    let orderData = {
        action: 'saveOrder',
        orderId: orderId,
        name: name,
        phone: phone,
        address: address,
        total: grandTotal,
        items: JSON.stringify(cart)
    };

    let loadingModal = document.getElementById("loading-modal");
    if(loadingModal) loadingModal.style.display = "flex";

    fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(orderData) })
    .then(res => res.json())
    .then(response => {
        if(loadingModal) loadingModal.style.display = "none";
        alert('รับออเดอร์เรียบร้อย! รหัสออเดอร์ของคุณคือ: ' + orderId + ' รอรับความอร่อยได้เลย!');
        localStorage.removeItem('secret_kitchen_cart'); 
        updateCartCount();
        fetchProducts(); 
        showPage('home'); 
    })
    .catch(error => {
        if(loadingModal) loadingModal.style.display = "none";
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ');
    });
}

function addProduct() {
    let fileInput = document.getElementById("p-image");
    let file = fileInput.files[0];
    if (!file) return alert("อย่าลืมใส่รูปอาหารน่ากินๆ ด้วยนะ");

    let name = document.getElementById("p-name").value;
    let price = document.getElementById("p-price").value;
    let stock = document.getElementById("p-stock").value;
    let detail = document.getElementById("p-detail").value;

    if (!name || !price) return alert("กรุณากรอกชื่อเมนูและราคาให้ครบถ้วน");

    let reader = new FileReader();
    reader.onload = function(e) {
        let base64 = e.target.result.split("base64,")[1]; 
        
        let payload = { action: "addProduct", name: name, price: price, stock: stock, detail: detail, imageBase64: base64, imageName: file.name, imageType: file.type };
        let loadingModal = document.getElementById("loading-modal");
        if(loadingModal) loadingModal.style.display = "flex";

        fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) })
        .then(res => res.json())
        .then(response => {
            if(loadingModal) loadingModal.style.display = "none";
            if (response.status === "success") {
                alert("เพิ่มเมนูลงระบบสำเร็จ!");
                document.getElementById("p-name").value = "";
                document.getElementById("p-price").value = "";
                document.getElementById("p-stock").value = "";
                document.getElementById("p-detail").value = "";
                fileInput.value = "";
                fetchProducts();
                showPage('home');
            } else {
                alert("เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
            }
        })
        .catch(error => {
            if(loadingModal) loadingModal.style.display = "none";
            console.error("Error:", error);
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        });
    };
    reader.readAsDataURL(file);
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-content').forEach(el => el.classList.add('d-none'));
    document.querySelectorAll('.nav-tabs .nav-link').forEach(el => el.classList.remove('active', 'fw-bold'));
    
    document.getElementById('admin-section-' + tabName).classList.remove('d-none');
    document.getElementById('tab-' + (tabName === 'addProduct' ? 'add-product' : tabName)).classList.add('active', 'fw-bold');

    if(tabName === 'orders') fetchOrders();
    if(tabName === 'users') fetchUsers();
}

function fetchOrders() {
    fetch(`${SCRIPT_URL}?action=getOrders`)
    .then(res => res.json())
    .then(data => {
        let html = '';
        if(data.length === 0) {
            document.getElementById('orders-table-body').innerHTML = `<tr><td colspan="3" class="text-center text-muted">ยังไม่มีออเดอร์</td></tr>`;
            return;
        }
        data.forEach(order => {
            let totalFormat = Number(order.total).toLocaleString();
            html += `<tr><td><span class="badge bg-secondary">${order.orderId}</span></td><td>${order.name}</td><td class="text-danger fw-bold">฿${totalFormat}</td></tr>`;
        });
        document.getElementById('orders-table-body').innerHTML = html;
    })
    .catch(err => {
        console.error("Error fetching orders:", err);
        document.getElementById('orders-table-body').innerHTML = `<tr><td colspan="3" class="text-center text-danger">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>`;
    });
}

function fetchUsers() {
    fetch(`${SCRIPT_URL}?action=getUsers`)
    .then(res => res.json())
    .then(data => {
        let html = '';
        data.forEach(u => {
            html += `<tr>
                <td>${u.email}</td>
                <td>${u.username}</td>
                <td>${u.name}</td>
                <td><span class="badge bg-${u.role === 'admin' ? 'danger' : 'primary'}">${u.role}</span></td>
            </tr>`;
        });
        document.getElementById('users-table-body').innerHTML = html;
    });
}