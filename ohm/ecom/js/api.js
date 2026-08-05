/* LCG SHOP — API Layer */
const api = {
  _cache: { products: null, users: null, orders: null },
  clearCache(t) { if(t) this._cache[t]=null; else this._cache={products:null,users:null,orders:null}; },
  async get(action) {
    const r = await fetch(`${CONFIG.API_URL}?action=${action}`);
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  },
  async post(action, payload={}) {
    await fetch(CONFIG.API_URL, { method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain'}, body:JSON.stringify({action,...payload}) });
    return {success:true};
  },
  async getProducts(f=false) { if(this._cache.products&&!f)return this._cache.products; const d=await this.get('getProducts'); this._cache.products=d.rows||[]; return this._cache.products; },
  async getProductById(id) { const p=await this.getProducts(); return p.find(x=>x.ID===id)||null; },
  async addProduct(p) { this.clearCache('products'); return await this.post('addProduct',{row:p}); },
  async updateProduct(id,u) { this.clearCache('products'); return await this.post('updateProduct',{id,row:u}); },
  async deleteProduct(id) { this.clearCache('products'); return await this.post('deleteProduct',{id}); },
  async getUsers(f=false) { if(this._cache.users&&!f)return this._cache.users; const d=await this.get('getUsers'); this._cache.users=d.rows||[]; return this._cache.users; },
  async findUserByEmail(e) { const u=await this.getUsers(); return u.find(x=>x.Email===e)||null; },
  async addUser(u) { this.clearCache('users'); return await this.post('addUser',{row:u}); },
  async updateUser(id,u) { this.clearCache('users'); return await this.post('updateUser',{id,row:u}); },
  async getOrders(f=false) { if(this._cache.orders&&!f)return this._cache.orders; const d=await this.get('getOrders'); this._cache.orders=d.rows||[]; return this._cache.orders; },
  async getOrdersByUser(uid) { const o=await this.getOrders(); return o.filter(x=>x.UserID===uid); },
  async addOrder(o) { this.clearCache('orders'); return await this.post('addOrder',{row:o}); },
  async updateOrder(id,u) { this.clearCache('orders'); return await this.post('updateOrder',{id,row:u}); },
};
