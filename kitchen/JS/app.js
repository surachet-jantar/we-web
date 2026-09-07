// app.js — legacy shim (kept for backward compat)
// All logic has been split into modules. Load order in index.html:
//   config.js -> utils.js -> navigation.js -> products.js -> auth.js -> modal.js -> cart.js -> checkout.js -> admin.js -> app.js
// This file intentionally does NOT redefine anything if modules are already loaded.
// It only provides a fallback if someone loads app.js standalone (e.g. old cached page).

(function() {
  // If modules already loaded, do nothing — they own the implementations.
  if (typeof getProductField === 'function' && typeof fetchProducts === 'function' && typeof openOrderModal === 'function') {
    console.log('[app.js] Modules already loaded — shim idle. DB:', typeof DB_MAP !== 'undefined' ? Object.keys(DB_MAP).join(', ') : 'n/a');
    return;
  }
  console.warn('[app.js] Modules not detected — standalone fallback. Please ensure index.html loads JS/*.js modules in order.');
})();
