/* ============================================================
   เนื้อดี — Main App (SPA)
   ============================================================ */

/* ---- Auth ---- */
const auth = {
  currentUser: null,
  init() { const s=localStorage.getItem('nd_user'); if(s)try{this.currentUser=JSON.parse(s);}catch{this.currentUser=null;} },
  isLoggedIn() { return this.currentUser!==null; },
  isAdmin() { return this.currentUser&&this.currentUser.Role==='admin'; },
  generateId(p='USR') { return p+'_'+Date.now()+'_'+Math.random().toString(36).substr(2,6); },
  async hashPassword(pw) { const d=new TextEncoder().encode(pw); const h=await crypto.subtle.digest('SHA-256',d); return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join(''); },
  async register({name,email,password,phone}) {
    const ex=await api.findUserByEmail(email); if(ex)throw new Error('อีเมลนี้ถูกใช้แล้ว');
    const hp=await this.hashPassword(password);
    const u={ID:this.generateId(),Name:name,Email:email,Password:hp,Phone:phone,Role:'user',CreatedAt:new Date().toISOString()};
    await api.addUser(u); return u;
  },
  async login(email,password) {
    const hp=await this.hashPassword(password);
    const users=await api.getUsers();
    const u=users.find(x=>x.Email===email&&x.Password===hp);
    if(!u)throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    this.currentUser=u; localStorage.setItem('nd_user',JSON.stringify(u)); return u;
  },
  logout() { this.currentUser=null; localStorage.removeItem('nd_user'); localStorage.removeItem('nd_cart'); },
  getUser() { return this.currentUser; },
  getDisplayName() { return this.currentUser?(this.currentUser.Name||this.currentUser.Email):''; },
};

/* ---- Router ---- */
const router = {
  routes: {},
  on(path, handler) { this.routes[path] = handler; },
  navigate(path) { location.hash = path; },
  getParam(key) { return new URLSearchParams(location.hash.split('?')[1]||'').get(key); },
  getPath() { return location.hash.split('?')[0].slice(1) || '/'; },
  init() {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  },
  resolve() {
    const path = this.getPath();
    const handler = this.routes[path] || this.routes['/'];
    if (handler) handler();
    window.scrollTo({top:0,behavior:'smooth'});
  }
};

/* ---- Toast ---- */
function showToast(msg, dur=3000) {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  c.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, dur);
}

/* ---- Render Nav ---- */
function renderNav() {
  const nav = document.getElementById('main-nav');
  if(!nav) return;
  auth.init(); cart.updateBadge();
  const logged = auth.isLoggedIn(), admin = auth.isAdmin();
  let h = `<div class="nav-inner">`;
  h += `<a href="#/" class="nav-brand"><span class="nav-brand-icon">🥩</span> เนื้อดี</a>`;
  h += `<button class="nav-hamburger" onclick="document.getElementById('nav-menu').classList.toggle('open')"><i class="fas fa-bars"></i></button>`;
  h += `<div class="nav-menu" id="nav-menu">`;
  h += `<a href="#/" class="nav-link">หน้าแรก</a>`;
  h += `<a href="#/products" class="nav-link">สินค้าทั้งหมด</a>`;
  h += `<a href="#/cart" class="nav-link cart-icon"><i class="fas fa-shopping-cart"></i> ตะกร้า <span class="cart-badge" id="cart-badge">${cart.getCount()}</span></a>`;
  if(logged){
    h += `<a href="#/account" class="nav-link"><i class="fas fa-user"></i> ${auth.getDisplayName()}</a>`;
    h += `<a href="#/orders" class="nav-link">คำสั่งซื้อ</a>`;
    if(admin) h += `<a href="#/admin" class="nav-link" style="color:var(--accent-dark);font-weight:600"><i class="fas fa-cog"></i> จัดการร้าน</a>`;
    h += `<a href="#" class="nav-link nav-link--danger" onclick="handleLogout(event)"><i class="fas fa-sign-out-alt"></i> ออก</a>`;
  } else {
    h += `<a href="#/login" class="nav-link"><i class="fas fa-sign-in-alt"></i> เข้าสู่ระบบ</a>`;
    h += `<a href="#/register" class="nav-link nav-link--accent">สมัครสมาชิก</a>`;
  }
  h += `</div></div>`;
  nav.innerHTML = h;
}

function renderFooter() {
  const f = document.getElementById('main-footer');
  if(!f) return;
  f.innerHTML = `<div class="footer-inner">
    <div class="footer-col"><h4>🥩 เนื้อดี</h4><p>ร้านขายเนื้อวัวคุณภาพดี คัดสรรเนื้อเกรดพรีเมียมจากทั่วโลก</p></div>
    <div class="footer-col"><h4>ติดต่อเรา</h4><p><i class="fas fa-phone"></i> 0XX-XXX-XXXX</p><p><i class="fas fa-envelope"></i> contact@nuadee.com</p></div>
    <div class="footer-col"><h4>เกี่ยวกับเรา</h4><p>เนื้อดี — ร้านขายเนื้อวัวเกรดพรีเมียม<br>คัดสรรจากแหล่งผลิตชั้นนำ</p></div>
  </div><div class="footer-bottom"><p>© 2026 เนื้อดี. สงวนลิขสิทธิ์</p></div>`;
}

function handleLogout(e) {
  e.preventDefault();
  auth.logout();
  showToast('ออกจากระบบแล้ว');
  router.navigate('/');
}

/* ---- Helpers ---- */
function requireLogin() { if(!auth.isLoggedIn()){showToast('กรุณาเข้าสู่ระบบ');router.navigate('/login');return false;} return true; }
function requireAdmin() { if(!auth.isAdmin()){showToast('ไม่มีสิทธิ์เข้าถึง');router.navigate('/');return false;} return true; }

function formatPrice(p) { return cart.formatPrice(p); }
function buildProductCard(p) {
  const name = p.Name_TH || '';
  const img = (p.ImageURLs && p.ImageURLs[0]) || 'https://via.placeholder.com/400x300/F9F5F0/6B5B4E?text=เนื้อ';
  const hasSale = p.SalePrice && Number(p.SalePrice) > 0 && Number(p.SalePrice) < Number(p.RegularPrice);
  const outOfStock = Number(p.Stock) <= 0;
  let badge = '';
  if(outOfStock) badge = '<span class="product-card-badge product-card-badge--out">สินค้าหมด</span>';
  else if(hasSale) badge = '<span class="product-card-badge product-card-badge--sale">ลดราคา</span>';

  return `<div class="product-card" onclick="router.navigate('/product?id=${p.ID}')">
    <div class="product-card-img">
      <img src="${img}" alt="${name}" loading="lazy">
      ${badge}
    </div>
    <div class="product-card-body">
      <div class="product-card-cut">${p.Cut || ''}</div>
      <div class="product-card-name">${name}</div>
      <div class="product-card-meta">
        ${p.Grade ? '<span>' + p.Grade + '</span>' : ''}
        ${p.Origin ? '<span>' + p.Origin + '</span>' : ''}
        ${p.Weight_kg ? '<span>' + p.Weight_kg + ' กก.</span>' : ''}
      </div>
      <div class="product-card-price">
        ${hasSale ? '<span class="price-old">' + formatPrice(p.RegularPrice) + '</span>' : ''}
        <span class="price-now">${formatPrice(hasSale ? p.SalePrice : p.RegularPrice)}</span>
      </div>
      <div class="product-card-btn">
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();addToCart('${p.ID}')" ${outOfStock ? 'disabled' : ''}>
          <i class="fas fa-cart-plus"></i> เพิ่มลงตะกร้า
        </button>
      </div>
    </div>
  </div>`;
}

async function addToCart(id) {
  if(!auth.isLoggedIn()){showToast('กรุณาเข้าสู่ระบบ');setTimeout(()=>router.navigate('/login'),400);return;}
  const p = await api.getProductById(id);
  if(p){cart.addItem(id,p,1);showToast('เพิ่มลงตะกร้าแล้ว ✓');}
}

function showLoading(el) { if(typeof el==='string') el=document.querySelector(el); if(el) el.innerHTML='<div class="loading"></div>'; }

/* ============================================================
   PAGES
   ============================================================ */

/* ---- HOME ---- */
function pageHome() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <span class="hero-badge">🥩 Premium Beef</span>
        <h1>เนื้อดี</h1>
        <p>คัดสรรเนื้อวัวเกรดพรีเมียมจากทั่วโลก เนื้อนุ่ม มาร์บิ้งสวย คุณภาพระดับสากล</p>
        <div class="hero-buttons">
          <a href="#/products" class="btn btn-gold btn-lg"><i class="fas fa-shopping-bag"></i> เลือกซื้อเลย</a>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-header"><h2>สินค้าแนะนำ</h2><p>เนื้อวัวเกรดพรีเมียม คัดสรรพิเศษ</p></div>
        <div class="product-grid" id="featured-grid"><div class="loading"></div></div>
        <div style="text-align:center;margin-top:1.3rem">
          <a href="#/products" class="btn btn-outline"><i class="fas fa-th-large"></i> ดูทั้งหมด</a>
        </div>
      </div>
    </section>
    <section class="section" style="background:var(--surface)">
      <div class="container">
        <div class="section-header"><h2>ทำไมต้องเลือกเรา</h2></div>
        <div class="why-grid">
          <div class="why-card"><div class="why-card-icon why-card-icon--red"><i class="fas fa-award"></i></div><h3>เนื้อคุณภาพ</h3><p>คัดสรรเนื้อเกรดพรีเมียม จากแหล่งผลิตชั้นนำทั่วโลก</p></div>
          <div class="why-card"><div class="why-card-icon why-card-icon--gold"><i class="fas fa-snowflake"></i></div><h3>สดใหม่ทุกวัน</h3><p>จัดส่งเนื้อสดใหม่ บรรจุ冷链 รักษาคุณภาพตลอดการเดินทาง</p></div>
          <div class="why-card"><div class="why-card-icon why-card-icon--green"><i class="fas fa-truck"></i></div><h3>จัดส่งทั่วไทย</h3><p>จัดส่งฟรีทั่วประเทศ ผ่านระบบ Cold Chain รักษาอุณหภูมิ</p></div>
          <div class="why-card"><div class="why-card-icon why-card-icon--warm"><i class="fas fa-headset"></i></div><h3>บริการหลังขาย</h3><p>ทีมงานเชี่ยวชาญด้านเนื้อ พร้อมให้คำแนะนำทุกคำถาม</p></div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="newsletter">
          <h3>รับข่าวสารโปรโมชั่น</h3>
          <p>สมัครรับข่าวสินค้าใหม่และโปรโมชั่นพิเศษ</p>
          <form class="newsletter-form" onsubmit="event.preventDefault();showToast('สมัครสำเร็จ!');">
            <input type="email" placeholder="กรอกอีเมล" required>
            <button type="submit">สมัคร</button>
          </form>
        </div>
      </div>
    </section>`;
  renderNav(); renderFooter();
  loadFeaturedProducts();
}

async function loadFeaturedProducts() {
  try {
    const products = await api.getProducts();
    const featured = products.slice(0, 4);
    const grid = document.getElementById('featured-grid');
    if(!grid) return;
    if(featured.length===0){grid.innerHTML='<div class="empty-state"><div class="empty-state-icon">📦</div><p>ยังไม่มีสินค้า</p></div>';return;}
    grid.innerHTML = featured.map(p => buildProductCard(p)).join('');
  } catch(e) {
    const grid = document.getElementById('featured-grid');
    if(grid) grid.innerHTML='<div class="empty-state"><div class="empty-state-icon">📦</div><p>ไม่สามารถโหลดสินค้าได้</p></div>';
  }
}

/* ---- PRODUCTS ---- */
let allProducts = [];
function pageProducts() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-header"><h2>สินค้าทั้งหมด</h2></div>
        <div class="products-layout">
          <aside class="products-sidebar">
            <div class="filter-group">
              <label><i class="fas fa-search"></i> ค้นหา</label>
              <div class="search-bar" style="margin-bottom:0"><input type="text" id="search-input" placeholder="ค้นหาสินค้า..." oninput="applyFilters()"></div>
            </div>
            <div class="filter-group">
              <label><i class="fas fa-tag"></i> ประเภท</label>
              <select id="filter-cut" onchange="applyFilters()"><option value="all">ทั้งหมด</option></select>
            </div>
            <div class="filter-group">
              <label><i class="fas fa-star"></i> เกรด</label>
              <select id="filter-grade" onchange="applyFilters()"><option value="all">ทั้งหมด</option></select>
            </div>
            <div class="filter-group">
              <label><i class="fas fa-globe"></i> แหล่งที่มา</label>
              <select id="filter-origin" onchange="applyFilters()"><option value="all">ทั้งหมด</option></select>
            </div>
            <div class="filter-group">
              <label><i class="fas fa-sort"></i> เรียงตาม</label>
              <select id="filter-sort" onchange="applyFilters()">
                <option value="newest">ใหม่ล่าสุด</option>
                <option value="price-low">ราคาต่ำ→สูง</option>
                <option value="price-high">ราคาสูง→ต่ำ</option>
                <option value="name">ชื่อ ก-ฮ</option>
              </select>
            </div>
          </aside>
          <div class="products-main">
            <p class="products-count" id="products-count"></p>
            <div class="product-grid" id="products-grid"><div class="loading"></div></div>
          </div>
        </div>
      </div>
    </section>`;
  renderNav(); renderFooter();
  loadAllProducts();
}

async function loadAllProducts() {
  try {
    allProducts = await api.getProducts();
    populateFilters(allProducts);
    applyFilters();
  } catch(e) {
    document.getElementById('products-grid').innerHTML='<div class="empty-state"><div class="empty-state-icon">📦</div><p>เกิดข้อผิดพลาด</p></div>';
  }
}

function populateFilters(products) {
  const cuts = [...new Set(products.map(p=>p.Cut).filter(Boolean))].sort();
  const grades = [...new Set(products.map(p=>p.Grade).filter(Boolean))].sort();
  const origins = [...new Set(products.map(p=>p.Origin).filter(Boolean))].sort();
  const addOpts = (id, vals) => { const sel=document.getElementById(id); if(!sel)return; vals.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;sel.appendChild(o);}); };
  addOpts('filter-cut', cuts);
  addOpts('filter-grade', grades);
  addOpts('filter-origin', origins);
}

function applyFilters() {
  let filtered = [...allProducts];
  const cut = document.getElementById('filter-cut').value;
  const grade = document.getElementById('filter-grade').value;
  const origin = document.getElementById('filter-origin').value;
  const sort = document.getElementById('filter-sort').value;
  const search = (document.getElementById('search-input').value||'').toLowerCase().trim();

  if(cut!=='all') filtered = filtered.filter(p=>p.Cut===cut);
  if(grade!=='all') filtered = filtered.filter(p=>p.Grade===grade);
  if(origin!=='all') filtered = filtered.filter(p=>p.Origin===origin);
  if(search) filtered = filtered.filter(p=>(p.Name_TH||'').toLowerCase().includes(search)||(p.Cut||'').toLowerCase().includes(search)||(p.Grade||'').toLowerCase().includes(search));

  switch(sort){
    case 'price-low': filtered.sort((a,b)=>Number(a.RegularPrice)-Number(b.RegularPrice)); break;
    case 'price-high': filtered.sort((a,b)=>Number(b.RegularPrice)-Number(a.RegularPrice)); break;
    case 'name': filtered.sort((a,b)=>(a.Name_TH||'').localeCompare(b.Name_TH||'','th')); break;
    default: filtered.sort((a,b)=>(b.CreatedAt||'').localeCompare(a.CreatedAt||''));
  }

  document.getElementById('products-count').textContent = filtered.length + ' รายการ';
  const grid = document.getElementById('products-grid');
  if(filtered.length===0){grid.innerHTML='<div class="empty-state"><div class="empty-state-icon">🔍</div><p>ไม่พบสินค้า</p></div>';return;}
  grid.innerHTML = filtered.map(p => buildProductCard(p)).join('');
}

/* ---- PRODUCT DETAIL ---- */
function pageProduct() {
  const id = router.getParam('id');
  if(!id){router.navigate('/products');return;}
  const app = document.getElementById('app');
  app.innerHTML = `<section class="section"><div class="container">
    <a href="#/products" class="btn btn-outline btn-sm" style="margin-bottom:1.2rem"><i class="fas fa-arrow-left"></i> สินค้าทั้งหมด</a>
    <div id="product-content"><div class="loading"></div></div>
  </div></section>`;
  renderNav(); renderFooter();
  loadProductDetail(id);
}

async function loadProductDetail(id) {
  try {
    const p = await api.getProductById(id);
    if(!p){document.getElementById('product-content').innerHTML='<div class="empty-state"><div class="empty-state-icon">🔍</div><p>ไม่พบสินค้า</p><a href="#/products" class="btn btn-primary">ดูสินค้าทั้งหมด</a></div>';return;}
    const name = p.Name_TH||'';
    const desc = p.Description_TH||'';
    const images = (p.ImageURLs&&p.ImageURLs.length>0)?p.ImageURLs:['https://via.placeholder.com/400x300/F9F5F0/6B5B4E?text=เนื้อ'];
    const hasSale = p.SalePrice && Number(p.SalePrice)>0 && Number(p.SalePrice)<Number(p.RegularPrice);
    const outOfStock = Number(p.Stock)<=0;

    let stockBadge = outOfStock
      ? `<div class="product-stock product-stock--out"><i class="fas fa-times-circle"></i> สินค้าหมด</div>`
      : `<div class="product-stock product-stock--in"><i class="fas fa-check-circle"></i> มีสินค้า (${p.Stock})</div>`;

    const specs = [
      ['ประเภท', p.Cut],
      ['เกรด', p.Grade],
      ['แหล่งที่มา', p.Origin],
      ['น้ำหนัก', p.Weight_kg ? p.Weight_kg+' กก.' : null],
      ['มาร์บิ้ง', p.Marbling],
    ].filter(s=>s[1]);

    document.getElementById('product-content').innerHTML = `
      <div class="product-detail">
        <div>
          <div class="product-gallery-main"><img id="main-image" src="${images[0]}" alt="${name}"></div>
          ${images.length>1?`<div class="product-gallery-thumbs">${images.map((img,i)=>`<img class="product-gallery-thumb ${i===0?'active':''}" src="${img}" alt="thumb ${i+1}" onclick="swapImage(this,'${img}')">`).join('')}</div>`:''}
        </div>
        <div class="product-info">
          <div class="product-info-cut">${p.Cut||''}</div>
          <h1 class="product-info-name">${name}</h1>
          <div class="product-info-price">
            ${hasSale?'<span class="price-old">'+formatPrice(p.RegularPrice)+'</span>':''}
            <span class="price-now">${formatPrice(hasSale?p.SalePrice:p.RegularPrice)}</span>
            ${hasSale?'<span class="product-card-badge product-card-badge--sale">ลดราคา</span>':''}
          </div>
          ${stockBadge}
          <button class="btn btn-primary btn-lg" onclick="addToCart('${p.ID}')" ${outOfStock?'disabled':''}>
            <i class="fas fa-cart-plus"></i> เพิ่มลงตะกร้า
          </button>
          <div class="product-specs">
            <h3><i class="fas fa-list"></i> รายละเอียดสินค้า</h3>
            <table class="specs-table">${specs.map(s=>`<tr><td>${s[0]}</td><td>${s[1]}</td></tr>`).join('')}</table>
          </div>
          ${desc?`<div class="product-desc"><h3><i class="fas fa-info-circle"></i> คำอธิบาย</h3><p>${desc}</p></div>`:''}
        </div>
      </div>`;
  } catch(e) {
    document.getElementById('product-content').innerHTML='<div class="empty-state"><div class="empty-state-icon">⚠️</div><p>เกิดข้อผิดพลาด</p></div>';
  }
}

function swapImage(thumb, src) {
  document.getElementById('main-image').src = src;
  document.querySelectorAll('.product-gallery-thumb').forEach(t=>t.classList.remove('active'));
  thumb.classList.add('active');
}

/* ---- CART ---- */
function pageCart() {
  const app = document.getElementById('app');
  app.innerHTML = `<section class="section"><div class="container">
    <div class="section-header"><h2>ตะกร้าสินค้า</h2></div>
    <div id="cart-content"></div>
  </div></section>`;
  renderNav(); renderFooter();
  renderCartPage();
}

function renderCartPage() {
  const items = cart.getItems();
  const container = document.getElementById('cart-content');
  if(items.length===0){
    container.innerHTML=`<div class="cart-empty"><div class="cart-empty-icon">🛒</div><p>ตะกร้าว่างเปล่า</p><a href="#/products" class="btn btn-primary"><i class="fas fa-shopping-bag"></i> เลือกซื้อต่อ</a></div>`;
    return;
  }
  let itemsHtml = items.map(item=>{
    const img = item.image || 'https://via.placeholder.com/400x300/F9F5F0/6B5B4E?text=เนื้อ';
    const name = item.name_TH || 'สินค้า';
    const price = item.salePrice>0?item.salePrice:item.regularPrice;
    return `<div class="cart-item">
      <img class="cart-item-img" src="${img}" alt="${name}">
      <div class="cart-item-info">
        <div class="cart-item-cut">${item.cut||''}</div>
        <h4>${name}</h4>
        <div class="cart-item-price">${formatPrice(price)}</div>
      </div>
      <div class="cart-item-actions">
        <div class="qty-control">
          <button onclick="updateQty('${item.productId}',${item.quantity-1})">−</button>
          <span>${item.quantity}</span>
          <button onclick="updateQty('${item.productId}',${item.quantity+1})">+</button>
        </div>
        <button class="btn btn-sm btn-outline" onclick="removeCartItem('${item.productId}')" style="color:var(--danger);border-color:var(--danger)"><i class="fas fa-trash"></i> ลบ</button>
      </div>
    </div>`;
  }).join('');

  container.innerHTML = `<div class="cart-layout">
    <div class="cart-items">${itemsHtml}</div>
    <div class="cart-summary">
      <h3><i class="fas fa-receipt"></i> สรุปคำสั่งซื้อ</h3>
      <div class="cart-summary-row"><span>จำนวน</span><span>${cart.getCount()} รายการ</span></div>
      <div class="cart-summary-row"><span>ราคารวม</span><span>${formatPrice(cart.getSubtotal())}</span></div>
      <div class="cart-summary-total"><span>ยอดรวมทั้งหมด</span><span>${formatPrice(cart.getTotal())}</span></div>
      <a href="#/checkout" class="btn btn-gold btn-full btn-lg"><i class="fas fa-credit-card"></i> ชำระเงิน</a>
      <div style="margin-top:.6rem;text-align:center"><a href="#/products" class="btn btn-outline btn-sm btn-full"><i class="fas fa-arrow-left"></i> เลือกซื้อต่อ</a></div>
    </div>
  </div>`;
}

function updateQty(id,qty){cart.updateQuantity(id,qty);renderCartPage();renderNav();}
function removeCartItem(id){cart.removeItem(id);renderCartPage();renderNav();showToast('ลบสินค้าแล้ว ✓');}

/* ---- CHECKOUT ---- */
function pageCheckout() {
  if(!requireLogin()) return;
  const items = cart.getItems();
  if(items.length===0){router.navigate('/cart');return;}
  const user = auth.getUser();
  const app = document.getElementById('app');
  const itemsHtml = items.map(item=>{
    const name = item.name_TH||'สินค้า';
    const price = item.salePrice>0?item.salePrice:item.regularPrice;
    return `<div class="cart-summary-row"><span>${name} × ${item.quantity}</span><span>${formatPrice(price*item.quantity)}</span></div>`;
  }).join('');

  app.innerHTML = `<section class="section"><div class="container">
    <div class="section-header"><h2>ชำระเงิน</h2></div>
    <div class="checkout-layout">
      <div class="checkout-form">
        <h3><i class="fas fa-shipping-fast"></i> ข้อมูลจัดส่ง</h3>
        <form id="checkout-form" onsubmit="submitOrder(event)">
          <div class="form-group"><label>ชื่อ-นามสกุล</label><input type="text" id="co-name" value="${user.Name||''}" required></div>
          <div class="form-group"><label>เบอร์โทร</label><input type="tel" id="co-phone" value="${user.Phone||''}" required></div>
          <div class="form-group"><label>ที่อยู่จัดส่ง</label><textarea id="co-address" rows="3" required></textarea></div>
          <div class="form-group"><label>หมายเหตุ</label><textarea id="co-note" rows="2"></textarea></div>
          <button type="submit" class="btn btn-gold btn-lg btn-full" id="co-submit-btn"><i class="fas fa-check-circle"></i> ยืนยันคำสั่งซื้อ</button>
        </form>
      </div>
      <div class="cart-summary">
        <h3><i class="fas fa-receipt"></i> สรุปคำสั่งซื้อ</h3>
        ${itemsHtml}
        <div class="cart-summary-total"><span>ยอดรวมทั้งหมด</span><span>${formatPrice(cart.getTotal())}</span></div>
      </div>
    </div>
  </div></section>`;
  renderNav(); renderFooter();
}

async function submitOrder(e) {
  e.preventDefault();
  const btn = document.getElementById('co-submit-btn');
  btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> กำลังดำเนินการ...';
  try {
    const user = auth.getUser();
    const order = cart.buildOrder(user);
    order.Name = document.getElementById('co-name').value;
    order.Phone = document.getElementById('co-phone').value;
    order.Address = document.getElementById('co-address').value;
    order.Notes = document.getElementById('co-note').value;
    await api.addOrder(order);
    cart.clear();
    router.navigate('/checkout-success?id='+order.ID);
  } catch(err) {
    showToast('เกิดข้อผิดพลาด');
    btn.disabled=false; btn.innerHTML='<i class="fas fa-check-circle"></i> ยืนยันคำสั่งซื้อ';
  }
}

/* ---- CHECKOUT SUCCESS ---- */
function pageCheckoutSuccess() {
  const id = router.getParam('id') || '';
  const app = document.getElementById('app');
  app.innerHTML = `<section class="section"><div class="container">
    <div class="success-page">
      <div class="success-icon"><i class="fas fa-check"></i></div>
      <h2>สั่งซื้อสำเร็จ!</h2>
      <p>ขอบคุณที่สั่งซื้อ เราจะติดต่อกลับเร็วๆ นี้</p>
      ${id?`<div class="success-id"><i class="fas fa-receipt"></i> รหัสคำสั่งซื้อ: ${id}</div>`:''}
      <a href="#/" class="btn btn-primary btn-lg" style="margin-top:1rem"><i class="fas fa-home"></i> กลับหน้าแรก</a>
    </div>
  </div></section>`;
  renderNav(); renderFooter();
}

/* ---- AUTH ---- */
let authMode = 'login';
function pageLogin() {
  if(auth.isLoggedIn()){router.navigate('/');return;}
  authMode='login';
  const app = document.getElementById('app');
  app.innerHTML = `<section class="auth-page"><div class="auth-card">
    <div class="auth-card-icon"><i class="fas fa-sign-in-alt"></i></div>
    <h2>เข้าสู่ระบบ</h2><p class="auth-card-sub">เนื้อดี</p>
    <form class="auth-form" onsubmit="handleLogin(event)">
      <div class="form-group"><label><i class="fas fa-envelope"></i> อีเมล</label><input type="email" id="login-email" required autocomplete="email"></div>
      <div class="form-group"><label><i class="fas fa-lock"></i> รหัสผ่าน</label><input type="password" id="login-password" required autocomplete="current-password"></div>
      <button type="submit" class="btn btn-primary btn-full btn-lg" id="login-btn"><i class="fas fa-sign-in-alt"></i> เข้าสู่ระบบ</button>
    </form>
    <div class="auth-switch">ยังไม่มีบัญชี? <a href="#/register">สมัครสมาชิก</a></div>
  </div></section>`;
  renderNav(); renderFooter();
}

function pageRegister() {
  if(auth.isLoggedIn()){router.navigate('/');return;}
  authMode='register';
  const app = document.getElementById('app');
  app.innerHTML = `<section class="auth-page"><div class="auth-card">
    <div class="auth-card-icon"><i class="fas fa-user-plus"></i></div>
    <h2>สมัครสมาชิก</h2><p class="auth-card-sub">เนื้อดี</p>
    <form class="auth-form" onsubmit="handleRegister(event)">
      <div class="form-group"><label><i class="fas fa-user"></i> ชื่อ-นามสกุล</label><input type="text" id="reg-name" required></div>
      <div class="form-group"><label><i class="fas fa-envelope"></i> อีเมล</label><input type="email" id="reg-email" required autocomplete="email"></div>
      <div class="form-group"><label><i class="fas fa-phone"></i> เบอร์โทร</label><input type="tel" id="reg-phone"></div>
      <div class="form-group"><label><i class="fas fa-lock"></i> รหัสผ่าน</label><input type="password" id="reg-password" required minlength="6" autocomplete="new-password"></div>
      <div class="form-group"><label><i class="fas fa-lock"></i> ยืนยันรหัสผ่าน</label><input type="password" id="reg-confirm" required minlength="6" autocomplete="new-password"></div>
      <button type="submit" class="btn btn-primary btn-full btn-lg" id="reg-btn"><i class="fas fa-user-plus"></i> สมัครสมาชิก</button>
    </form>
    <div class="auth-switch">มีบัญชีแล้ว? <a href="#/login">เข้าสู่ระบบ</a></div>
  </div></section>`;
  renderNav(); renderFooter();
}

async function handleLogin(e) {
  e.preventDefault();
  const btn=document.getElementById('login-btn');
  btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> กำลังเข้าสู่ระบบ...';
  try {
    await auth.login(document.getElementById('login-email').value, document.getElementById('login-password').value);
    showToast('เข้าสู่ระบบสำเร็จ ✓');
    setTimeout(()=>router.navigate('/'),300);
  } catch(err) {
    showToast(err.message||'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    btn.disabled=false; btn.innerHTML='<i class="fas fa-sign-in-alt"></i> เข้าสู่ระบบ';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const pw=document.getElementById('reg-password').value;
  const cpw=document.getElementById('reg-confirm').value;
  if(pw!==cpw){showToast('รหัสผ่านไม่ตรงกัน');return;}
  const btn=document.getElementById('reg-btn');
  btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> กำลังสมัคร...';
  try {
    await auth.register({
      name:document.getElementById('reg-name').value,
      email:document.getElementById('reg-email').value,
      password:pw,
      phone:document.getElementById('reg-phone').value
    });
    showToast('สมัครสำเร็จ! กรุณาเข้าสู่ระบบ');
    setTimeout(()=>router.navigate('/login'),400);
  } catch(err) {
    showToast(err.message||'สมัครไม่สำเร็จ');
    btn.disabled=false; btn.innerHTML='<i class="fas fa-user-plus"></i> สมัครสมาชิก';
  }
}

/* ---- ACCOUNT ---- */
function pageAccount() {
  if(!requireLogin()) return;
  const user = auth.getUser();
  const app = document.getElementById('app');
  app.innerHTML = `<section class="section"><div class="container" style="max-width:560px">
    <div class="section-header"><h2>โปรไฟล์</h2></div>
    <div class="checkout-form">
      <div class="form-group"><label>ชื่อ</label><input type="text" id="acc-name" value="${user.Name||''}"></div>
      <div class="form-group"><label>อีเมล</label><input type="email" value="${user.Email||''}" disabled></div>
      <div class="form-group"><label>เบอร์โทร</label><input type="tel" id="acc-phone" value="${user.Phone||''}"></div>
      <div class="form-group"><label>บทบาท</label><input type="text" value="${user.Role||'user'}" disabled></div>
    </div>
  </div></section>`;
  renderNav(); renderFooter();
}

/* ---- ORDERS ---- */
function pageOrders() {
  if(!requireLogin()) return;
  const app = document.getElementById('app');
  app.innerHTML = `<section class="section"><div class="container">
    <div class="section-header"><h2>ประวัติคำสั่งซื้อ</h2></div>
    <div id="orders-content"><div class="loading"></div></div>
  </div></section>`;
  renderNav(); renderFooter();
  loadOrders();
}

async function loadOrders() {
  try {
    const user = auth.getUser();
    const orders = await api.getOrdersByUser(user.ID);
    const container = document.getElementById('orders-content');
    if(orders.length===0){container.innerHTML='<div class="empty-state"><div class="empty-state-icon">📦</div><p>ยังไม่มีคำสั่งซื้อ</p><a href="#/products" class="btn btn-primary">เลือกซื้อเลย</a></div>';return;}
    const statusBadge = s => {
      const m={'pending':'badge--pending','shipped':'badge--shipped','delivered':'badge--delivered'};
      const l={'pending':'รอดำเนินการ','shipped':'จัดส่งแล้ว','delivered':'จัดส่งสำเร็จ'};
      return `<span class="badge ${m[s]||''}">${l[s]||s}</span>`;
    };
    container.innerHTML = `<div class="admin-table-wrapper"><table class="admin-table">
      <thead><tr><th>รหัส</th><th>วันที่</th><th>สถานะ</th><th>ยอดรวม</th></tr></thead>
      <tbody>${orders.map(o=>`<tr>
        <td><strong>${o.ID||''}</strong></td>
        <td>${o.CreatedAt?new Date(o.CreatedAt).toLocaleDateString('th-TH'):'-'}</td>
        <td>${statusBadge(o.Status)}</td>
        <td><strong>${formatPrice(o.TotalPrice||0)}</strong></td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  } catch(e) {
    document.getElementById('orders-content').innerHTML='<div class="empty-state"><div class="empty-state-icon">⚠️</div><p>เกิดข้อผิดพลาด</p></div>';
  }
}

/* ---- ADMIN ---- */
function pageAdmin() {
  if(!requireLogin()||!requireAdmin()) return;
  const app = document.getElementById('app');
  app.innerHTML = `<section class="section"><div class="container">
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-title">🥩 จัดการร้าน</div>
        <div class="admin-sidebar-nav">
          <a href="#/admin" class="active"><i class="fas fa-tachometer-alt"></i> แดชบอร์ด</a>
          <a href="#/admin/products"><i class="fas fa-box"></i> สินค้า</a>
          <a href="#/admin/orders"><i class="fas fa-receipt"></i> คำสั่งซื้อ</a>
          <a href="#/admin/users"><i class="fas fa-users"></i> ผู้ใช้</a>
        </div>
      </aside>
      <div class="admin-main">
        <div class="admin-header"><h2>แดชบอร์ด</h2></div>
        <div class="admin-stats" id="admin-stats"><div class="loading"></div></div>
      </div>
    </div>
  </div></section>`;
  renderNav(); renderFooter();
  loadAdminStats();
}

async function loadAdminStats() {
  try {
    const [products,orders,users] = await Promise.all([api.getProducts(),api.getOrders(),api.getUsers()]);
    const revenue = orders.reduce((s,o)=>s+Number(o.TotalPrice||0),0);
    document.getElementById('admin-stats').innerHTML = `
      <div class="stat-card"><div class="stat-card-icon stat-card-icon--red"><i class="fas fa-box"></i></div><div class="stat-card-value">${products.length}</div><div class="stat-card-label">สินค้าทั้งหมด</div></div>
      <div class="stat-card"><div class="stat-card-icon stat-card-icon--gold"><i class="fas fa-receipt"></i></div><div class="stat-card-value">${orders.length}</div><div class="stat-card-label">คำสั่งซื้อ</div></div>
      <div class="stat-card"><div class="stat-card-icon stat-card-icon--green"><i class="fas fa-users"></i></div><div class="stat-card-value">${users.length}</div><div class="stat-card-label">ผู้ใช้</div></div>
      <div class="stat-card"><div class="stat-card-icon stat-card-icon--warm"><i class="fas fa-baht-sign"></i></div><div class="stat-card-value">${formatPrice(revenue)}</div><div class="stat-card-label">รายได้รวม</div></div>`;
  } catch(e) {
    document.getElementById('admin-stats').innerHTML='<div class="empty-state"><p>เกิดข้อผิดพลาด</p></div>';
  }
}

/* ---- ADMIN PRODUCTS ---- */
function pageAdminProducts() {
  if(!requireLogin()||!requireAdmin()) return;
  const app = document.getElementById('app');
  app.innerHTML = `<section class="section"><div class="container">
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-title">🥩 จัดการร้าน</div>
        <div class="admin-sidebar-nav">
          <a href="#/admin"><i class="fas fa-tachometer-alt"></i> แดชบอร์ด</a>
          <a href="#/admin/products" class="active"><i class="fas fa-box"></i> สินค้า</a>
          <a href="#/admin/orders"><i class="fas fa-receipt"></i> คำสั่งซื้อ</a>
          <a href="#/admin/users"><i class="fas fa-users"></i> ผู้ใช้</a>
        </div>
      </aside>
      <div class="admin-main">
        <div class="admin-header"><h2>จัดการสินค้า</h2></div>
        <div id="admin-products-content"><div class="loading"></div></div>
      </div>
    </div>
  </div></section>`;
  renderNav(); renderFooter();
  loadAdminProducts();
}

async function loadAdminProducts() {
  try {
    const products = await api.getProducts();
    const c = document.getElementById('admin-products-content');
    if(products.length===0){c.innerHTML='<div class="empty-state"><p>ยังไม่มีสินค้า</p></div>';return;}
    c.innerHTML = `<div class="admin-table-wrapper"><table class="admin-table">
      <thead><tr><th>ID</th><th>ชื่อ</th><th>ประเภท</th><th>เกรด</th><th>ราคา</th><th>คงเหลือ</th></tr></thead>
      <tbody>${products.map(p=>`<tr>
        <td>${p.ID}</td>
        <td><strong>${p.Name_TH||''}</strong></td>
        <td>${p.Cut||''}</td>
        <td>${p.Grade||''}</td>
        <td>${formatPrice(p.SalePrice>0?p.SalePrice:p.RegularPrice)}</td>
        <td>${p.Stock||0}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  } catch(e) {
    document.getElementById('admin-products-content').innerHTML='<div class="empty-state"><p>เกิดข้อผิดพลาด</p></div>';
  }
}

/* ---- ADMIN ORDERS ---- */
function pageAdminOrders() {
  if(!requireLogin()||!requireAdmin()) return;
  const app = document.getElementById('app');
  app.innerHTML = `<section class="section"><div class="container">
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-title">🥩 จัดการร้าน</div>
        <div class="admin-sidebar-nav">
          <a href="#/admin"><i class="fas fa-tachometer-alt"></i> แดชบอร์ด</a>
          <a href="#/admin/products"><i class="fas fa-box"></i> สินค้า</a>
          <a href="#/admin/orders" class="active"><i class="fas fa-receipt"></i> คำสั่งซื้อ</a>
          <a href="#/admin/users"><i class="fas fa-users"></i> ผู้ใช้</a>
        </div>
      </aside>
      <div class="admin-main">
        <div class="admin-header"><h2>คำสั่งซื้อ</h2></div>
        <div id="admin-orders-content"><div class="loading"></div></div>
      </div>
    </div>
  </div></section>`;
  renderNav(); renderFooter();
  loadAdminOrders();
}

async function loadAdminOrders() {
  try {
    const orders = await api.getOrders();
    const c = document.getElementById('admin-orders-content');
    const statusBadge = s => {
      const m={'pending':'badge--pending','shipped':'badge--shipped','delivered':'badge--delivered'};
      const l={'pending':'รอดำเนินการ','shipped':'จัดส่งแล้ว','delivered':'จัดส่งสำเร็จ'};
      return `<span class="badge ${m[s]||''}">${l[s]||s}</span>`;
    };
    c.innerHTML = `<div class="admin-table-wrapper"><table class="admin-table">
      <thead><tr><th>รหัส</th><th>ลูกค้า</th><th>ยอดรวม</th><th>สถานะ</th><th>วันที่</th></tr></thead>
      <tbody>${orders.map(o=>`<tr>
        <td><strong>${o.ID||''}</strong></td>
        <td>${o.Name||''}</td>
        <td>${formatPrice(o.TotalPrice||0)}</td>
        <td>${statusBadge(o.Status)}</td>
        <td>${o.CreatedAt?new Date(o.CreatedAt).toLocaleDateString('th-TH'):'-'}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  } catch(e) {
    document.getElementById('admin-orders-content').innerHTML='<div class="empty-state"><p>เกิดข้อผิดพลาด</p></div>';
  }
}

/* ---- ADMIN USERS ---- */
function pageAdminUsers() {
  if(!requireLogin()||!requireAdmin()) return;
  const app = document.getElementById('app');
  app.innerHTML = `<section class="section"><div class="container">
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-title">🥩 จัดการร้าน</div>
        <div class="admin-sidebar-nav">
          <a href="#/admin"><i class="fas fa-tachometer-alt"></i> แดชบอร์ด</a>
          <a href="#/admin/products"><i class="fas fa-box"></i> สินค้า</a>
          <a href="#/admin/orders"><i class="fas fa-receipt"></i> คำสั่งซื้อ</a>
          <a href="#/admin/users" class="active"><i class="fas fa-users"></i> ผู้ใช้</a>
        </div>
      </aside>
      <div class="admin-main">
        <div class="admin-header"><h2>ผู้ใช้</h2></div>
        <div id="admin-users-content"><div class="loading"></div></div>
      </div>
    </div>
  </div></section>`;
  renderNav(); renderFooter();
  loadAdminUsers();
}

async function loadAdminUsers() {
  try {
    const users = await api.getUsers();
    const c = document.getElementById('admin-users-content');
    c.innerHTML = `<div class="admin-table-wrapper"><table class="admin-table">
      <thead><tr><th>ID</th><th>ชื่อ</th><th>อีเมล</th><th>บทบาท</th><th>วันที่สมัคร</th></tr></thead>
      <tbody>${users.map(u=>`<tr>
        <td>${u.ID}</td>
        <td><strong>${u.Name||''}</strong></td>
        <td>${u.Email||''}</td>
        <td><span class="badge ${u.Role==='admin'?'badge--shipped':'badge--pending'}">${u.Role||'user'}</span></td>
        <td>${u.CreatedAt?new Date(u.CreatedAt).toLocaleDateString('th-TH'):'-'}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  } catch(e) {
    document.getElementById('admin-users-content').innerHTML='<div class="empty-state"><p>เกิดข้อผิดพลาด</p></div>';
  }
}

/* ============================================================
   ROUTE INIT
   ============================================================ */
router.on('/', pageHome);
router.on('/products', pageProducts);
router.on('/product', pageProduct);
router.on('/cart', pageCart);
router.on('/checkout', pageCheckout);
router.on('/checkout-success', pageCheckoutSuccess);
router.on('/login', pageLogin);
router.on('/register', pageRegister);
router.on('/account', pageAccount);
router.on('/orders', pageOrders);
router.on('/admin', pageAdmin);
router.on('/admin/products', pageAdminProducts);
router.on('/admin/orders', pageAdminOrders);
router.on('/admin/users', pageAdminUsers);

document.addEventListener('DOMContentLoaded', () => {
  auth.init();
  cart.updateBadge();
  router.init();
});
