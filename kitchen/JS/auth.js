// auth.js — register / login / logout
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
