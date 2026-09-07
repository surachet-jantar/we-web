// modal.js — order customization modal (category-aware)
function openOrderModal(productId) {
    currentModalProduct = allProducts.find(p => String(p.id || p.ID || p.product_id) === String(productId));
    if (!currentModalProduct) return;
    currentModalQty = 1;
    let productName = getProductField(currentModalProduct, ['name','Name'], 'เมนู');
    let cat = inferCategory(currentModalProduct);
    document.getElementById('modal-product-name').innerText = productName;
    document.getElementById('modal-product-price-base').innerText = Number(getProductField(currentModalProduct, ['price','Price'], 0)).toLocaleString();
    let catBadge = document.getElementById('modal-product-category');
    if (catBadge) catBadge.innerText = cat;
    document.getElementById('modal-qty').innerText = currentModalQty;
    document.getElementById('modal-custom-note').value = '';
    generateModalOptions(productName, cat, currentModalProduct);
    document.querySelectorAll('.addon-option, .choice-option').forEach(el => {
        el.onchange = updateModalPrice;
    });
    updateModalPrice();
    let modalEl = document.getElementById('orderModal');
    let modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modalInstance.show();
}

function generateModalOptions(name, category, product) {
    let choicesHtml = '';
    let addonsHtml = '';
    let notesHtml = '';

    if (category === 'ผัด') {
        choicesHtml = `
            <h6 class="fw-bold text-primary border-bottom pb-2 mt-2">🥩 เลือกเนื้อสัตว์</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="meat_choice" value="หมูสับ" data-price="0" id="c-pork" checked><label class="form-check-label" for="c-pork">หมูสับ (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="meat_choice" value="ไก่ชิ้น" data-price="0" id="c-chicken"><label class="form-check-label" for="c-chicken">ไก่ชิ้น (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="meat_choice" value="หมูกรอบ" data-price="15" id="c-crispypork"><label class="form-check-label" for="c-crispypork">หมูกรอบ (+15)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="meat_choice" value="ทะเล" data-price="20" id="c-seafood"><label class="form-check-label" for="c-seafood">ทะเล กุ้ง+หมึก (+20)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="meat_choice" value="รวมมิตร" data-price="25" id="c-mixed"><label class="form-check-label" for="c-mixed">รวมมิตร (+25)</label></div>
            <h6 class="fw-bold text-danger border-bottom pb-2 mt-3">🌶️ ระดับความเผ็ด</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="spicy_level" value="เผ็ดน้อย" data-price="0" id="s-mild"><label class="form-check-label" for="s-mild">เผ็ดน้อย</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="spicy_level" value="เผ็ดกลาง" data-price="0" id="s-mid" checked><label class="form-check-label" for="s-mid">เผ็ดกลาง (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="spicy_level" value="เผ็ดมาก" data-price="0" id="s-hot"><label class="form-check-label" for="s-hot">เผ็ดมาก</label></div>
        `;
    } else if (category === 'ทอด') {
        // ของทอด = รวม ไก่ทอดกระเทียม + ไก่ทอดหาดใหญ่ + หมูทอดกระเทียม
        if (name === 'ของทอด') {
            choicesHtml = `
            <h6 class="fw-bold text-primary border-bottom pb-2 mt-2">🍗 เลือกเนื้อ</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="fried_meat" value="ไก่" data-price="0" id="fm-chicken" checked><label class="form-check-label" for="fm-chicken">ไก่ (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="fried_meat" value="หมู" data-price="0" id="fm-pork"><label class="form-check-label" for="fm-pork">หมู (ปกติ)</label></div>
            <h6 class="fw-bold border-bottom pb-2 mt-3">✨ เลือกสไตล์</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="fried_style" value="กระเทียม" data-price="0" id="fs-garlic" checked><label class="form-check-label" for="fs-garlic">กระเทียม (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="fried_style" value="หาดใหญ่" data-price="0" id="fs-hatyai"><label class="form-check-label" for="fs-hatyai">หาดใหญ่ หอมเจียว ยี่หร่า</label></div>
            <h6 class="fw-bold border-bottom pb-2 mt-3">🍗 เลือกน้ำจิ้ม</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="dip_choice" value="น้ำจิ้มแจ่ว" data-price="0" id="d-jaew" checked><label class="form-check-label" for="d-jaew">น้ำจิ้มแจ่ว (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="dip_choice" value="ซอสพริก" data-price="0" id="d-chili"><label class="form-check-label" for="d-chili">ซอสพริก</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="dip_choice" value="มายองเนส" data-price="0" id="d-mayo"><label class="form-check-label" for="d-mayo">มายองเนส</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="dip_choice" value="น้ำจิ้มไก่" data-price="0" id="d-chicken"><label class="form-check-label" for="d-chicken">น้ำจิ้มไก่</label></div>
            `;
        } else {
            choicesHtml = `
            <h6 class="fw-bold text-primary border-bottom pb-2 mt-2">🍗 เลือกน้ำจิ้ม</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="dip_choice" value="น้ำจิ้มแจ่ว" data-price="0" id="d-jaew" checked><label class="form-check-label" for="d-jaew">น้ำจิ้มแจ่ว (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="dip_choice" value="ซอสพริก" data-price="0" id="d-chili"><label class="form-check-label" for="d-chili">ซอสพริก</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="dip_choice" value="มายองเนส" data-price="0" id="d-mayo"><label class="form-check-label" for="d-mayo">มายองเนส</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="dip_choice" value="น้ำจิ้มไก่" data-price="0" id="d-chicken"><label class="form-check-label" for="d-chicken">น้ำจิ้มไก่</label></div>
            `;
        }
    } else if (category === 'ต้ม') {
        if (name === 'ต้มยำ') {
            choicesHtml = `
            <h6 class="fw-bold text-primary border-bottom pb-2 mt-2">🍲 เลือกเนื้อ</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="tomyum_meat" value="กุ้ง" data-price="0" id="tm-shrimp" checked><label class="form-check-label" for="tm-shrimp">กุ้ง (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="tomyum_meat" value="ทะเลรวม" data-price="20" id="tm-seafood"><label class="form-check-label" for="tm-seafood">ทะเลรวม กุ้ง+หมึก+หอย (+20)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="tomyum_meat" value="หมูสับ" data-price="0" id="tm-pork"><label class="form-check-label" for="tm-pork">หมูสับ</label></div>
            <h6 class="fw-bold border-bottom pb-2 mt-3">🍲 เลือกรสชาติ</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="soup_taste" value="น้ำข้น" data-price="0" id="t-thick" checked><label class="form-check-label" for="t-thick">น้ำข้น (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="soup_taste" value="น้ำใส" data-price="0" id="t-clear"><label class="form-check-label" for="t-clear">น้ำใส</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="soup_taste" value="ต้มจืด" data-price="0" id="t-mildsoup"><label class="form-check-label" for="t-mildsoup">ต้มจืด ไม่เผ็ด</label></div>
            <h6 class="fw-bold text-danger border-bottom pb-2 mt-3">🌶️ ความเผ็ด</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="spicy_soup" value="เผ็ดน้อย" data-price="0" id="ss-mild"><label class="form-check-label" for="ss-mild">เผ็ดน้อย</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="spicy_soup" value="เผ็ดกลาง" data-price="0" id="ss-mid" checked><label class="form-check-label" for="ss-mid">เผ็ดกลาง</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="spicy_soup" value="เผ็ดมาก" data-price="0" id="ss-hot"><label class="form-check-label" for="ss-hot">เผ็ดมาก</label></div>
            `;
        } else {
            choicesHtml = `
            <h6 class="fw-bold text-primary border-bottom pb-2 mt-2">🍲 เลือกรสชาติ</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="soup_taste" value="ต้มยำน้ำข้น" data-price="0" id="t-thick" checked><label class="form-check-label" for="t-thick">น้ำข้น (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="soup_taste" value="ต้มยำน้ำใส" data-price="0" id="t-clear"><label class="form-check-label" for="t-clear">น้ำใส</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="soup_taste" value="ต้มจืด" data-price="0" id="t-mildsoup"><label class="form-check-label" for="t-mildsoup">ต้มจืด ไม่เผ็ด</label></div>
            <h6 class="fw-bold text-danger border-bottom pb-2 mt-3">🌶️ ความเผ็ด</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="spicy_soup" value="เผ็ดน้อย" data-price="0" id="ss-mild"><label class="form-check-label" for="ss-mild">เผ็ดน้อย</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="spicy_soup" value="เผ็ดกลาง" data-price="0" id="ss-mid" checked><label class="form-check-label" for="ss-mid">เผ็ดกลาง</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="spicy_soup" value="เผ็ดมาก" data-price="0" id="ss-hot"><label class="form-check-label" for="ss-hot">เผ็ดมาก</label></div>
            `;
        }
        if (name.includes('คอนซอมเม')) {
            choicesHtml = `
            <h6 class="fw-bold text-primary border-bottom pb-2 mt-2">🥖 เสิร์ฟพร้อม</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="consomme_serve" value="เสิร์ฟพร้อมขนมปังกระเทียม" data-price="0" id="cs-bread" checked><label class="form-check-label" for="cs-bread">ขนมปังกระเทียม (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="consomme_serve" value="เสิร์ฟพร้อมข้าวสวย" data-price="0" id="cs-rice"><label class="form-check-label" for="cs-rice">ข้าวสวย</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="consomme_serve" value="ซุปอย่างเดียว" data-price="0" id="cs-only"><label class="form-check-label" for="cs-only">ซุปอย่างเดียว</label></div>
            `;
        }
    } else if (category === 'ยำ') {
        if (name === 'ยำ') {
            choicesHtml = `
            <h6 class="fw-bold text-primary border-bottom pb-2 mt-2">🥗 เลือกเนื้อ</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="yum_meat" value="หมูยอ" data-price="0" id="ym-mooyor" checked><label class="form-check-label" for="ym-mooyor">หมูยอ (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="yum_meat" value="แซลมอน" data-price="60" id="ym-salmon"><label class="form-check-label" for="ym-salmon">แซลมอน (+60)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="yum_meat" value="ทะเลรวม" data-price="40" id="ym-seafood"><label class="form-check-label" for="ym-seafood">ทะเลรวม (+40)</label></div>
            <h6 class="fw-bold border-bottom pb-2 mt-3">🥗 เลือกปลาร้า</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="plara_choice" value="ไม่ปลาร้า" data-price="0" id="pl-no" checked><label class="form-check-label" for="pl-no">ไม่ปลาร้า (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="plara_choice" value="ปลาร้า" data-price="0" id="pl-yes"><label class="form-check-label" for="pl-yes">ใส่ปลาร้า</label></div>
            <h6 class="fw-bold text-danger border-bottom pb-2 mt-3">🌶️ ความเผ็ด</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="yum_spicy" value="เผ็ดน้อย" data-price="0" id="y-mild"><label class="form-check-label" for="y-mild">เผ็ดน้อย</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="yum_spicy" value="เผ็ดกลาง" data-price="0" id="y-mid" checked><label class="form-check-label" for="y-mid">เผ็ดกลาง</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="yum_spicy" value="เผ็ดมาก" data-price="0" id="y-hot"><label class="form-check-label" for="y-hot">เผ็ดมาก</label></div>
            `;
        } else {
            choicesHtml = `
            <h6 class="fw-bold text-primary border-bottom pb-2 mt-2">🥗 เลือกปลาร้า</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="plara_choice" value="ไม่ปลาร้า" data-price="0" id="pl-no" checked><label class="form-check-label" for="pl-no">ไม่ปลาร้า (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="plara_choice" value="ปลาร้า" data-price="0" id="pl-yes"><label class="form-check-label" for="pl-yes">ใส่ปลาร้า</label></div>
            <h6 class="fw-bold text-danger border-bottom pb-2 mt-3">🌶️ ความเผ็ด</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="yum_spicy" value="เผ็ดน้อย" data-price="0" id="y-mild"><label class="form-check-label" for="y-mild">เผ็ดน้อย</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="yum_spicy" value="เผ็ดกลาง" data-price="0" id="y-mid" checked><label class="form-check-label" for="y-mid">เผ็ดกลาง</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="yum_spicy" value="เผ็ดมาก" data-price="0" id="y-hot"><label class="form-check-label" for="y-hot">เผ็ดมาก</label></div>
            `;
        }
    } else if (category === 'ของหวาน') {
        choicesHtml = `
            <h6 class="fw-bold text-primary border-bottom pb-2 mt-2">🧁 ระดับความหวาน</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="sweet_level" value="หวานน้อย" data-price="0" id="sw-low"><label class="form-check-label" for="sw-low">หวานน้อย</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="sweet_level" value="หวานปกติ" data-price="0" id="sw-mid" checked><label class="form-check-label" for="sw-mid">หวานปกติ</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="sweet_level" value="หวานมาก" data-price="0" id="sw-high"><label class="form-check-label" for="sw-high">หวานมาก</label></div>
            <h6 class="fw-bold border-bottom pb-2 mt-3">❄️ เสิร์ฟแบบ</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="serve_temp" value="เสิร์ฟเย็น" data-price="0" id="sv-cold" checked><label class="form-check-label" for="sv-cold">เสิร์ฟเย็น (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="serve_temp" value="อุ่นร้อน" data-price="0" id="sv-warm"><label class="form-check-label" for="sv-warm">อุ่นร้อน</label></div>
        `;
    } else if (category === 'นึ่ง') {
        choicesHtml = `
            <h6 class="fw-bold text-primary border-bottom pb-2 mt-2">🥟 เลือกน้ำจิ้ม</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="steam_dip" value="จิ๊กโฉ่ว" data-price="0" id="st-jik" checked><label class="form-check-label" for="st-jik">จิ๊กโฉ่ว (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="steam_dip" value="น้ำจิ้มสุกี้" data-price="0" id="st-suki"><label class="form-check-label" for="st-suki">น้ำจิ้มสุกี้</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="steam_dip" value="ซีอิ๊วดำ" data-price="0" id="st-soy"><label class="form-check-label" for="st-soy">ซีอิ๊วดำหวาน</label></div>
            <h6 class="fw-bold border-bottom pb-2 mt-3">📦 จำนวน</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="steam_pack" value="3 ลูก" data-price="0" id="sp-3" checked><label class="form-check-label" for="sp-3">3 ลูก (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="steam_pack" value="6 ลูก" data-price="30" id="sp-6"><label class="form-check-label" for="sp-6">6 ลูก (+30)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="steam_pack" value="12 ลูก" data-price="60" id="sp-12"><label class="form-check-label" for="sp-12">12 ลูก (+60)</label></div>
        `;
        if (name.includes('ซาลาเปา')) {
            choicesHtml = `
            <h6 class="fw-bold text-primary border-bottom pb-2 mt-2">🥟 ไส้ซาลาเปา</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="pao_filling" value="หมูสับไข่เค็ม" data-price="0" id="pao-pork" checked><label class="form-check-label" for="pao-pork">หมูสับไข่เค็ม (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="pao_filling" value="หมูแดง" data-price="0" id="pao-red"><label class="form-check-label" for="pao-red">หมูแดง</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="pao_filling" value="ครีม" data-price="0" id="pao-cream"><label class="form-check-label" for="pao-cream">ครีม</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="pao_filling" value="ถั่วดำ" data-price="0" id="pao-bean"><label class="form-check-label" for="pao-bean">ถั่วดำ</label></div>
            `;
        }
    } else if (category === 'ปิ้ง/ย่าง') {
        choicesHtml = `
            <h6 class="fw-bold text-primary border-bottom pb-2 mt-2">🔥 ระดับความสุก</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="doneness" value="สุกพอดี" data-price="0" id="dn-mid" checked><label class="form-check-label" for="dn-mid">สุกพอดี (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="doneness" value="สุกมาก" data-price="0" id="dn-well"><label class="form-check-label" for="dn-well">สุกมาก แห้งๆ</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="doneness" value="สุกน้อยฉ่ำๆ" data-price="0" id="dn-rare"><label class="form-check-label" for="dn-rare">สุกน้อย ฉ่ำๆ</label></div>
            <h6 class="fw-bold border-bottom pb-2 mt-3">🥣 น้ำจิ้ม</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="grill_dip" value="แจ่ว" data-price="0" id="gd-jaew" checked><label class="form-check-label" for="gd-jaew">แจ่ว (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="grill_dip" value="ซีฟู้ด" data-price="0" id="gd-seafood"><label class="form-check-label" for="gd-seafood">ซีฟู้ดแซ่บ</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="grill_dip" value="หวาน" data-price="0" id="gd-sweet"><label class="form-check-label" for="gd-sweet">หวาน</label></div>
        `;
        if (name.includes('หมูปิ้ง')) {
            choicesHtml = `
            <h6 class="fw-bold text-primary border-bottom pb-2 mt-2">🍢 จำนวนไม้</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="skewer_count" value="3 ไม้" data-price="0" id="sk-3" checked><label class="form-check-label" for="sk-3">3 ไม้ (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="skewer_count" value="5 ไม้" data-price="30" id="sk-5"><label class="form-check-label" for="sk-5">5 ไม้ (+30)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="skewer_count" value="10 ไม้" data-price="75" id="sk-10"><label class="form-check-label" for="sk-10">10 ไม้ (+75)</label></div>
            <h6 class="fw-bold border-bottom pb-2 mt-3">🥣 น้ำจิ้ม</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="grill_dip2" value="แจ่ว" data-price="0" id="gd2-jaew" checked><label class="form-check-label" for="gd2-jaew">แจ่ว</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="grill_dip2" value="ซีฟู้ด" data-price="0" id="gd2-seafood"><label class="form-check-label" for="gd2-seafood">ซีฟู้ด</label></div>
            `;
        }
    } else {
        if (name.includes('ข้าวผัด') || name.includes('ราดหน้า') || name.includes('ผัดไทย') || name.includes('ข้าว')) {
            choicesHtml = `
            <h6 class="fw-bold text-primary border-bottom pb-2 mt-2">🥩 เลือกเนื้อสัตว์</h6>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="meat_choice2" value="หมู" data-price="0" id="c2-pork" checked><label class="form-check-label" for="c2-pork">หมู (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="meat_choice2" value="ไก่" data-price="0" id="c2-chicken"><label class="form-check-label" for="c2-chicken">ไก่ (ปกติ)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="meat_choice2" value="กุ้ง" data-price="20" id="c2-shrimp"><label class="form-check-label" for="c2-shrimp">กุ้ง (+20)</label></div>
            <div class="form-check mb-2"><input class="form-check-input choice-option" type="radio" name="meat_choice2" value="ทะเล" data-price="25" id="c2-seafood"><label class="form-check-label" for="c2-seafood">ทะเล (+25)</label></div>
            `;
        }
    }
    document.getElementById('modal-dynamic-choices').innerHTML = choicesHtml;

    if (category === 'ของหวาน') {
        addonsHtml = `
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="เพิ่มวิปครีม" data-price="10" id="a-whip"><label class="form-check-label" for="a-whip">เพิ่มวิปครีม (+10)</label></div>
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="เพิ่มไอศกรีมวานิลลา" data-price="25" id="a-ice"><label class="form-check-label" for="a-ice">เพิ่มไอศกรีมวานิลลา (+25)</label></div>
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="ราดซอสช็อกโกแลต" data-price="10" id="a-choc"><label class="form-check-label" for="a-choc">ราดซอสช็อกโกแลต (+10)</label></div>
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="เพิ่มผลไม้รวม" data-price="15" id="a-fruit"><label class="form-check-label" for="a-fruit">เพิ่มผลไม้รวม (+15)</label></div>
        `;
    } else if (category === 'นึ่ง') {
        addonsHtml = `
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="เพิ่มน้ำจิ้ม" data-price="5" id="a-dip5"><label class="form-check-label" for="a-dip5">เพิ่มน้ำจิ้ม (+5)</label></div>
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="เพิ่มผักเคียง" data-price="10" id="a-veg"><label class="form-check-label" for="a-veg">เพิ่มผักเคียง (+10)</label></div>
        `;
    } else if (category === 'ปิ้ง/ย่าง') {
        addonsHtml = `
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="ข้าวเหนียว" data-price="10" id="a-sticky"><label class="form-check-label" for="a-sticky">ข้าวเหนียว (+10)</label></div>
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="ส้มตำไทย" data-price="35" id="a-somtam"><label class="form-check-label" for="a-somtam">ส้มตำไทย (+35)</label></div>
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="น้ำจิ้มเพิ่ม" data-price="5" id="a-dipadd"><label class="form-check-label" for="a-dipadd">น้ำจิ้มเพิ่ม (+5)</label></div>
        `;
    } else if (category === 'ต้ม') {
        addonsHtml = `
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="เพิ่มเครื่องแน่น" data-price="20" id="a-extra"><label class="form-check-label" for="a-extra">เพิ่มเครื่องแน่น (+20)</label></div>
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="ข้าวสวย" data-price="10" id="a-rice10"><label class="form-check-label" for="a-rice10">ข้าวสวย (+10)</label></div>
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="ไข่เจียว" data-price="15" id="a-egg15"><label class="form-check-label" for="a-egg15">ไข่เจียว (+15)</label></div>
        `;
    } else if (category === 'ยำ') {
        addonsHtml = `
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="เพิ่มไข่เยี่ยวม้า" data-price="15" id="a-century"><label class="form-check-label" for="a-century">เพิ่มไข่เยี่ยวม้า (+15)</label></div>
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="เพิ่มหมูยอ" data-price="20" id="a-mooyor"><label class="form-check-label" for="a-mooyor">เพิ่มหมูยอ (+20)</label></div>
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="ข้าวเหนียว" data-price="10" id="a-sticky2"><label class="form-check-label" for="a-sticky2">ข้าวเหนียว (+10)</label></div>
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="ขนมจีน" data-price="10" id="a-noodle"><label class="form-check-label" for="a-noodle">ขนมจีน (+10)</label></div>
        `;
    } else if (category === 'ทอด') {
        addonsHtml = `
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="ข้าวเหนียว" data-price="10" id="a-sticky3"><label class="form-check-label" for="a-sticky3">ข้าวเหนียว (+10)</label></div>
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="ข้าวสวย" data-price="10" id="a-rice10b"><label class="form-check-label" for="a-rice10b">ข้าวสวย (+10)</label></div>
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="พิเศษเพิ่มชิ้น" data-price="20" id="a-more"><label class="form-check-label" for="a-more">พิเศษเพิ่มชิ้น (+20)</label></div>
        `;
    } else {
        addonsHtml = `
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="พิเศษ เพิ่มข้าว" data-price="10" id="a-rice"><label class="form-check-label" for="a-rice">พิเศษ เพิ่มข้าว (+10)</label></div>
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="พิเศษ เพิ่มกับ" data-price="20" id="a-meat"><label class="form-check-label" for="a-meat">พิเศษ เพิ่มกับ (+20)</label></div>
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="ไข่ดาว" data-price="10" id="a-egg1"><label class="form-check-label" for="a-egg1">เพิ่มไข่ดาว (+10)</label></div>
            <div class="form-check mb-2"><input class="form-check-input addon-option" type="checkbox" value="ไข่เจียว" data-price="15" id="a-egg2"><label class="form-check-label" for="a-egg2">เพิ่มไข่เจียว (+15)</label></div>
        `;
    }
    document.getElementById('modal-dynamic-addons').innerHTML = addonsHtml;

    if (category === 'ของหวาน') {
        notesHtml = `
            <div class="form-check mb-2"><input class="form-check-input note-option" type="checkbox" value="ไม่เอาถั่ว" id="n-nopea"><label class="form-check-label" for="n-nopea">ไม่เอาถั่ว</label></div>
            <div class="form-check mb-2"><input class="form-check-input note-option" type="checkbox" value="แยกซอส" id="n-sauce"><label class="form-check-label" for="n-sauce">แยกซอส/แยกเครื่อง</label></div>
            <div class="form-check mb-2"><input class="form-check-input note-option" type="checkbox" value="ไม่เอาลูกชิด" id="n-nojelly"><label class="form-check-label" for="n-nojelly">ไม่เอาลูกชิด/วุ้น</label></div>
        `;
    } else if (category === 'นึ่ง' || category === 'ปิ้ง/ย่าง') {
        notesHtml = `
            <div class="form-check mb-2"><input class="form-check-input note-option" type="checkbox" value="ไม่เอาผักเคียง" id="n-noveg2"><label class="form-check-label" for="n-noveg2">ไม่เอาผักเคียง</label></div>
            <div class="form-check mb-2"><input class="form-check-input note-option" type="checkbox" value="แยกน้ำจิ้ม" id="n-sep"><label class="form-check-label" for="n-sep">แยกน้ำจิ้ม</label></div>
            <div class="form-check mb-2"><input class="form-check-input note-option" type="checkbox" value="หั่นให้" id="n-cut"><label class="form-check-label" for="n-cut">หั่นให้พร้อมทาน</label></div>
        `;
    } else {
        notesHtml = `
            <div class="form-check mb-2"><input class="form-check-input note-option" type="checkbox" value="ไม่ใส่ผัก" id="n-noveg"><label class="form-check-label" for="n-noveg">ไม่ใส่ผัก</label></div>
            <div class="form-check mb-2"><input class="form-check-input note-option" type="checkbox" value="ไม่ใส่ผงชูรส" id="n-nomsg"><label class="form-check-label" for="n-nomsg">ไม่ใส่ผงชูรส</label></div>
            <div class="form-check mb-2"><input class="form-check-input note-option" type="checkbox" value="ทำเป็นกับข้าว" id="n-onlymeat"><label class="form-check-label" for="n-onlymeat">ทำเป็นกับข้าว (ไม่ราดข้าว)</label></div>
            <div class="form-check mb-2"><input class="form-check-input note-option" type="checkbox" value="ขอช้อนส้อมเพิ่ม" id="n-utensil"><label class="form-check-label" for="n-utensil">ขอช้อนส้อมเพิ่ม</label></div>
        `;
    }
    document.getElementById('modal-dynamic-notes').innerHTML = notesHtml;
}

function updateModalPrice() {
    if (!currentModalProduct) return;
    let basePrice = Number(getProductField(currentModalProduct, ['price','Price'], 0));
    let addonPrice = 0;
    document.querySelectorAll('.choice-option:checked').forEach(el => {
        addonPrice += Number(el.getAttribute('data-price') || 0);
    });
    document.querySelectorAll('.addon-option:checked').forEach(cb => {
        addonPrice += Number(cb.getAttribute('data-price') || 0);
    });
    let unitPrice = basePrice + addonPrice;
    let totalPrice = unitPrice * currentModalQty;
    document.getElementById('modal-total-price').innerText = totalPrice.toLocaleString();
}

function changeModalQty(amount) {
    if (currentModalQty + amount >= 1) {
        currentModalQty += amount;
        document.getElementById('modal-qty').innerText = currentModalQty;
        updateModalPrice();
    }
}

function confirmAddToCart() {
    if (!currentModalProduct) return;
    let selectedOptions = [];
    let addonPrice = 0;
    document.querySelectorAll('.choice-option:checked').forEach(el => {
        selectedOptions.push(el.value);
        addonPrice += Number(el.getAttribute('data-price') || 0);
    });
    document.querySelectorAll('.addon-option:checked').forEach(cb => {
        selectedOptions.push(cb.value);
        addonPrice += Number(cb.getAttribute('data-price') || 0);
    });
    document.querySelectorAll('.note-option:checked').forEach(cb => {
        selectedOptions.push(cb.value);
    });
    let customNote = document.getElementById('modal-custom-note').value.trim();
    if (customNote) selectedOptions.push(customNote);
    let optionsString = selectedOptions.length > 0 ? selectedOptions.join(', ') : '';
    let finalUnitPrice = Number(getProductField(currentModalProduct, ['price','Price'], 0)) + addonPrice;
    let cart = JSON.parse(localStorage.getItem('secret_kitchen_cart')) || [];
    let pId = currentModalProduct.id || currentModalProduct.ID || currentModalProduct.product_id;
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
