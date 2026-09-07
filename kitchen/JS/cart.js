// cart.js — cart state (localStorage: secret_kitchen_cart)
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('secret_kitchen_cart')) || [];
    let totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    let el = document.getElementById('cart-count');
    if (el) el.innerText = totalCount;
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
                        <img src="${item.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" class="me-3 shadow-sm" loading="lazy">
                        <span class="fw-bold">${item.name}</span>
                        ${item.options ? `<br><small class="text-danger fw-bold" style="font-size:0.8em;">(${item.options})</small>` : ''}
                    </div>
                </td>
                <td data-label="ราคา">฿${Number(item.price).toLocaleString()}</td>
                <td data-label="จำนวน">
                    <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${index}, -1)" aria-label="ลดจำนวน">-</button>
                    <span class="mx-2 fw-bold">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary" onclick="changeQty(${index}, 1)" aria-label="เพิ่มจำนวน">+</button>
                </td>
                <td data-label="ราคารวม" class="text-danger fw-bold">฿${Number(totalItemPrice).toLocaleString()}</td>
                <td data-label="จัดการ"><button class="btn btn-sm btn-danger shadow-sm" onclick="removeFromCart(${index})">ลบ</button></td>
            </tr>`;
        });
    }
    let body = document.getElementById('cart-table-body');
    if (body) body.innerHTML = html;
    let totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.innerText = grandTotal.toLocaleString();
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
