// utils.js — shared helpers
function getProductField(p, keys, fallback) {
    for (let k of keys) if (p[k] !== undefined && p[k] !== null && p[k] !== '') return p[k];
    return fallback;
}

function inferCategory(p) {
    let catId = getProductField(p, ['category_id','categoryId','category','Category','type','Type','group','Group'], '');
    if (catId && CATEGORY_MAP[catId]) return CATEGORY_MAP[catId];
    if (catId) {
        let c = String(catId).trim();
        if (['ผัด','ทอด','ต้ม','ยำ','ของหวาน','นึ่ง','ปิ้ง/ย่าง','ข้าว','เส้น','อื่นๆ'].includes(c)) return c;
        if (c.includes('หวาน') || c.includes('dessert')) return 'ของหวาน';
        if (c.includes('นึ่ง') || c.includes('steamed')) return 'นึ่ง';
        if (c.includes('ย่าง') || c.includes('ปิ้ง') || c.includes('grilled')) return 'ปิ้ง/ย่าง';
    }
    let name = String(getProductField(p, ['name','Name'], '') + ' ' + getProductField(p, ['detail','Detail'], '')).toLowerCase();
    if (name.includes('คัพเค้ก') || name.includes('กล้วยบวชชี') || name.includes('ทาร์ตไข่') || name.includes('บวชชี') || name.includes('ทาร์ต')) return 'ของหวาน';
    if (name.includes('ซาลาเปา') || name.includes('ขนมจีบ') || name.includes('เกี๊ยว') && name.includes('นึ่ง') || name.includes('ซาลาเปา')) return 'นึ่ง';
    if (name.includes('เกี๊ยวซ่า')) return 'นึ่ง';
    if (name.includes('เนื้อย่าง') || name.includes('หมูปิ้ง') || name.includes('ไก่ย่าง') || name.includes('ย่าง') && !name.includes('ผัด')) return 'ปิ้ง/ย่าง';
    if (name.includes('ยำ')) return 'ยำ';
    if (name.includes('ต้มยำ') || name.includes('ต้มจืด') || name.includes('คอนซอมเม') || name.includes('ต้ม')) return 'ต้ม';
    if (name.includes('กะเพรา') || name.includes('ผัด') || name.includes('คั่ว')) return 'ผัด';
    if (name.includes('ทอด') || name.includes('เทมปุระ') || name.includes('กรอบ')) return 'ทอด';
    if (name.includes('ส้มตำ') || name.includes('ลาบ')) return 'ยำ';
    if (name.includes('ข้าว')) return 'ข้าว';
    if (name.includes('เส้น') || name.includes('ผัดไทย') || name.includes('ราดหน้า') || name.includes('ซีอิ๊ว')) return 'เส้น';
    return 'อื่นๆ';
}
