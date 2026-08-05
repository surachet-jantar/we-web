/* LCG SHOP — Shared Navigation + Footer */
function renderNav() {
  const nav = document.getElementById('main-nav');
  if(!nav) return;
  auth.init(); cart.updateBadge();
  const logged=auth.isLoggedIn(), admin=auth.isAdmin(), lang=getLang();
  const L = location.pathname.includes('/admin/') ? '../' : '';
  let h=`<div class="nav-container"><a href="${L}index.html" class="nav-logo"><span class="nav-logo-icon">📽️</span> LCG SHOP</a>`;
  h+=`<button class="nav-hamburger" onclick="document.getElementById('nav-menu').classList.toggle('open')"><i class="fas fa-bars"></i></button>`;
  h+=`<div class="nav-menu" id="nav-menu">`;
  h+=`<a href="${L}index.html" class="nav-link">${t('nav_home')}</a>`;
  h+=`<a href="${L}products.html" class="nav-link">${t('nav_products')}</a>`;
  h+=`<a href="${L}cart.html" class="nav-link nav-cart"><i class="fas fa-shopping-cart"></i> ${t('nav_cart')} <span class="cart-badge" id="cart-badge">${cart.getCount()}</span></a>`;
  if(logged){
    h+=`<a href="${L}account.html" class="nav-link"><i class="fas fa-user"></i> ${t('nav_profile')}</a>`;
    h+=`<a href="${L}account.html#orders" class="nav-link">${t('nav_orders')}</a>`;
    if(admin) h+=`<a href="${L}admin/index.html" class="nav-link nav-link-admin"><i class="fas fa-cog"></i> ${t('nav_admin')}</a>`;
    h+=`<a href="#" class="nav-link" onclick="auth.logout();location.href='${L}index.html';"><i class="fas fa-sign-out-alt"></i> ${t('nav_logout')}</a>`;
  } else {
    h+=`<a href="${L}auth.html" class="nav-link"><i class="fas fa-sign-in-alt"></i> ${t('nav_login')}</a>`;
    h+=`<a href="${L}auth.html#register" class="nav-link nav-link-register">${t('nav_register')}</a>`;
  }
  h+=`<button class="lang-btn" onclick="toggleLang()">${lang==='th'?'🇹🇭 TH':'🇬🇧 EN'}</button>`;
  h+=`</div></div>`;
  nav.innerHTML=h;
  document.documentElement.lang=lang;
}

function renderFooter() {
  const f=document.getElementById('main-footer');
  if(!f)return;
  f.innerHTML=`<div class="footer-container">
    <div class="footer-col"><h4>📽️ LCG SHOP</h4><p>${t('hero_subtitle')}</p></div>
    <div class="footer-col"><h4>${t('footer_contact')}</h4><p><i class="fas fa-phone"></i> 0XX-XXX-XXXX</p><p><i class="fas fa-envelope"></i> contact@lcgshop.com</p></div>
    <div class="footer-col"><h4>${t('footer_about')}</h4><p>LCG SHOP — ร้านขายโปรเจคเตอร์คุณภาพ<br>Quality projector store.</p></div>
  </div><div class="footer-bottom"><p>${t('footer_copyright')}</p></div>`;
}

function showToast(msg, dur=3000) {
  const e=document.querySelector('.toast'); if(e)e.remove();
  const toast=document.createElement('div'); toast.className='toast'; toast.textContent=msg;
  document.body.appendChild(toast);
  setTimeout(()=>toast.classList.add('show'),10);
  setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.remove(),300);},dur);
}

function requireLogin() { if(!auth.isLoggedIn()){location.href=location.pathname.includes('/admin/')?'../auth.html':'auth.html';return false;} return true; }
function requireAdmin() { if(!auth.isAdmin()){location.href=location.pathname.includes('/admin/')?'../index.html':'index.html';return false;} return true; }
