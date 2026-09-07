// navigation.js — page routing
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(el => el.classList.add('d-none'));
    document.getElementById('page-' + pageId).classList.remove('d-none');
    if (pageId === 'checkout') renderCheckout();
    if (pageId === 'cart') renderCart();
}

window.onload = function() {
    fetchProducts();
    checkLoginState();
};

window.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    bindMenuFilterEvents();
});
