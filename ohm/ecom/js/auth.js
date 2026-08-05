/* LCG SHOP — Auth */
const auth = {
  currentUser: null,
  init() { const s=localStorage.getItem('lcg_user'); if(s)try{this.currentUser=JSON.parse(s);}catch{this.currentUser=null;} },
  isLoggedIn() { return this.currentUser!==null; },
  isAdmin() { return this.currentUser&&this.currentUser.Role==='admin'; },
  generateId(p='USR') { return p+'_'+Date.now()+'_'+Math.random().toString(36).substr(2,6); },
  async hashPassword(pw) { const d=new TextEncoder().encode(pw); const h=await crypto.subtle.digest('SHA-256', d); return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join(''); },
  async register({name,email,password,phone}) {
    const ex=await api.findUserByEmail(email); if(ex)throw new Error(t('register_error'));
    const hp=await this.hashPassword(password);
    const u={ID:this.generateId(),Name:name,Email,email:email,Password:hp,Phone:phone,Role:'user',CreatedAt:new Date().toISOString()};
    await api.addUser(u); return u;
  },
  async login(email,password) {
    const hp=await this.hashPassword(password);
    const users=await api.getUsers();
    const u=users.find(x=>x.Email===email&&x.Password===hp);
    if(!u)throw new Error(t('login_error'));
    this.currentUser=u; localStorage.setItem('lcg_user',JSON.stringify(u)); return u;
  },
  logout() { this.currentUser=null; localStorage.removeItem('lcg_user'); localStorage.removeItem('lcg_cart'); },
  getUser() { return this.currentUser; },
  getDisplayName() { return this.currentUser?(this.currentUser.Name||this.currentUser.Email):''; },
};
