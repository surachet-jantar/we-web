// products.js — fetch, filter, render menu
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
        let pUnit = getProductField(p, ['unit','Unit'], 'ต่อจาน');
        let pStock = getProductField(p, ['stock','Stock'], 0);
        let pImage = getProductField(p, ['image','Image'], 'https://via.placeholder.com/250');
        let pDetailRaw = getProductField(p, ['detail','Detail'], 'ไม่มีรายละเอียด');
        let pDetail = String(pDetailRaw).replace(/\n/g, '<br>');
        let pCat = inferCategory(p);
        let formattedPrice = Number(pPrice).toLocaleString();
        let stockBadge = pStock > 0 ? `<span class="badge bg-success badge-custom">พร้อมเสิร์ฟ</span>` : `<span class="badge bg-danger badge-custom">วัตถุดิบหมด</span>`;
        let catBadge = `<span class="badge bg-dark bg-opacity-75 position-absolute" style="top:15px; right:15px; z-index:10; font-size:0.75rem;">${pCat}</span>`;
        html += `
            <div class="col-12 col-sm-6 col-lg-4 mb-4">
                <div class="card h-100 shadow-sm position-relative border-0">
                    ${stockBadge}
                    ${catBadge}
                    <img src="${pImage}" class="card-img-top product-img" alt="${pName}" loading="lazy">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold text-dark mb-1">${pName}</h5>
                        <p class="card-text text-muted small mb-2" style="white-space: pre-line;">${pDetail}</p>
                        <div class="mt-auto pt-3 border-top">
                            <h4 class="text-danger fw-bold mb-1">฿${formattedPrice} <small class="text-muted fw-normal" style="font-size:0.6em;">${pUnit}</small></h4>
                            <p class="text-secondary small mb-3">ทำได้อีก: ${pStock} ${pUnit.replace('ต่อ','')}</p>
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
