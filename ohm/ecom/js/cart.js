/* LCG SHOP — Cart (localStorage) */
const cart = {
  getItems() { const d=localStorage.getItem('lcg_cart'); return d?JSON.parse(d):[]; },
  saveItems(items) { localStorage.setItem('lcg_cart',JSON.stringify(items)); this.updateBadge(); },
  addItem(productId, product, qty=1) {
    const items=this.getItems();
    const ex=items.find(i=>i.productId===productId);
    if(ex){ex.quantity+=qty;} else {
      items.push({productId, name_TH:product.Name_TH||'', name_EN:product.Name_EN||'', brand:product.Brand||'',
        image:(product.ImageURLs&&product.ImageURLs[0])||'', regularPrice:Number(product.RegularPrice)||0,
        salePrice:Number(product.SalePrice)||0, stock:Number(product.Stock)||0, quantity:qty});
    }
    this.saveItems(items); return items;
  },
  updateQuantity(productId, qty) {
    const items=this.getItems(); const i=items.find(x=>x.productId===productId);
    if(i){if(qty<=0)return this.removeItem(productId); i.quantity=qty; this.saveItems(items);} return items;
  },
  removeItem(productId) { let items=this.getItems(); items=items.filter(i=>i.productId!==productId); this.saveItems(items); return items; },
  clear() { localStorage.removeItem('lcg_cart'); this.updateBadge(); },
  getCount() { return this.getItems().reduce((s,i)=>s+i.quantity,0); },
  getSubtotal() { return this.getItems().reduce((s,i)=>{const p=i.salePrice>0?i.salePrice:i.regularPrice; return s+p*i.quantity;},0); },
  getTotal() { return this.getSubtotal(); },
  formatPrice(p) { return '฿'+Number(p).toLocaleString('th-TH',{minimumFractionDigits:0,maximumFractionDigits:0}); },
  updateBadge() { const b=document.getElementById('cart-badge'); if(b){const c=this.getCount(); b.textContent=c; b.style.display=c>0?'inline-flex':'none';} },
  buildOrder(user) {
    return {ID:'ORD_'+Date.now()+'_'+Math.random().toString(36).substr(2,6), UserID:user.ID,
      Items:JSON.stringify(this.getItems().map(i=>({productId:i.productId,name:i.name_EN||i.name_TH,quantity:i.quantity,price:i.salePrice>0?i.salePrice:i.regularPrice}))),
      TotalPrice:this.getTotal(), Name:user.Name||'', Phone:user.Phone||'', Address:'', TrackingNumber:'', Status:'pending', CreatedAt:new Date().toISOString()};
  },
};
