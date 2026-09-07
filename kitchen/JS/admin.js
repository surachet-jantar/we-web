// admin.js — add product + admin tabs (Orders / Users)
function addProduct() {
    let fileInput = document.getElementById("p-image");
    let file = fileInput.files[0];
    if (!file) return alert("อย่าลืมใส่รูปอาหารน่ากินๆ ด้วยนะ");
    let name = document.getElementById("p-name").value.trim();
    let price = document.getElementById("p-price").value;
    let stock = document.getElementById("p-stock").value;
    let detail = document.getElementById("p-detail").value.trim();
    let category = document.getElementById("p-category")?.value || "";
    if (!name || !price) return alert("กรุณากรอกชื่อเมนูและราคาให้ครบถ้วน");
    let reader = new FileReader();
    reader.onload = function(e) {
        let base64 = e.target.result.split("base64,")[1];
        let payload = { action: "addProduct", name: name, price: price, stock: stock, detail: detail, category_id: category, category: category, imageBase64: base64, imageName: file.name, imageType: file.type };
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
                let catSel = document.getElementById("p-category"); if(catSel) catSel.value = "";
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
