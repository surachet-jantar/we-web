// checkout.js — checkout summary + submit order
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
    let list = document.getElementById('checkout-item-list');
    if (list) list.innerHTML = html;
    let totalEl = document.getElementById('checkout-total');
    if (totalEl) totalEl.innerText = grandTotal.toLocaleString() + ' บาท';
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
