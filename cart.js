
const CART_KEY = 'sendo_cart';

function readCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch(e){ return []; }
}
function writeCart(items){
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartCount();
}
function updateCartCount(){
  const count = readCart().reduce((s,i)=> s + i.qty, 0);
  const el = document.getElementById('cartCount');
  if(el) el.textContent = count;
}
function addToCart(productId, qty=1){
  const cart = readCart();
  const found = cart.find(i=> i.id === productId);
  if(found){ found.qty += qty; }
  else { cart.push({id: productId, qty}); }
  writeCart(cart);
  toast('Đã thêm vào giỏ');
}
function removeFromCart(productId){
  const cart = readCart().filter(i=> i.id !== productId);
  writeCart(cart);
  renderCartPage();
}
function setQty(productId, qty){
  const cart = readCart();
  const item = cart.find(i=> i.id === productId);
  if(item){ item.qty = Math.max(1, qty|0); writeCart(cart); }
  renderCartPage();
}
function mapCartItems(){
  const cart = readCart();
  return cart.map(ci => {
    const p = PRODUCTS.find(x=> x.id === ci.id);
    return { ...p, qty: ci.qty, lineTotal: (p.salePrice||p.price) * ci.qty };
  });
}
function toast(msg){
  const el = document.createElement('div');
  el.className = 'toast align-items-center text-bg-dark border-0 position-fixed bottom-0 end-0 m-3';
  el.role = 'alert'; el.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
  document.body.appendChild(el);
  const t = new bootstrap.Toast(el, {delay:1000}); t.show();
  el.addEventListener('hidden.bs.toast', ()=> el.remove());
}

// Page renders
function renderCartPage(){
  const wrap = document.getElementById('cartItems');
  if(!wrap) return;
  const items = mapCartItems();
  if(items.length===0){
    wrap.innerHTML = `<div class="alert alert-info">Giỏ hàng trống. <a href="index.html">Tiếp tục mua sắm</a></div>`;
  } else {
    wrap.innerHTML = items.map(it=> `
      <div class="card shadow-sm mb-3">
        <div class="card-body d-flex align-items-center gap-3">
          <img src="${it.image}" alt="${it.name}" width="72" height="72" class="rounded" style="object-fit:cover">
          <div class="flex-grow-1">
            <a href="product.html?id=${it.id}" class="fw-semibold text-decoration-none text-dark">${it.name}</a>
            <div class="small text-muted">${it.category}</div>
            <div class="mt-1"><span class="price me-2">${formatVND(it.salePrice||it.price)}</span>${it.salePrice?`<span class="price-old">${formatVND(it.price)}</span>`:''}</div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <input type="number" min="1" value="${it.qty}" class="form-control form-control-sm" style="width:80px" onchange="setQty(${it.id}, this.value)">
            <span class="fw-semibold" style="width:120px; text-align:right">${formatVND(it.lineTotal)}</span>
            <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${it.id})"><i class="fa fa-trash"></i></button>
          </div>
        </div>
      </div>
    `).join('');
  }
  const subtotal = items.reduce((s,i)=> s+i.lineTotal, 0);
  const shipEl = document.getElementById('shipping');
  const ship = items.length? 15000 : 0;
  if(shipEl) shipEl.textContent = formatVND(ship);
  const subEl = document.getElementById('subtotal');
  if(subEl) subEl.textContent = formatVND(subtotal);
  const totalEl = document.getElementById('total');
  if(totalEl) totalEl.textContent = formatVND(subtotal + ship);
}

function renderCheckoutPage(){
  const items = mapCartItems();
  const wrap = document.getElementById('orderSummary');
  if(!wrap) return;
  if(items.length===0){
    wrap.innerHTML = `<div class="alert alert-warning">Giỏ hàng trống. <a href="index.html">Mua sắm ngay</a></div>`;
    return;
  }
  wrap.innerHTML = items.map(i=> `
    <div class="d-flex justify-content-between small mb-2">
      <span>${i.name} × ${i.qty}</span><span>{price}</span>
    </div>`.replace('{price}', formatVND(i.lineTotal))
  ).join('') + `<hr><div class="d-flex justify-content-between"><span>Tổng</span><strong>{total}</strong></div>`.replace('{total}', formatVND(items.reduce((s,i)=> s+i.lineTotal,0)));

  document.getElementById('checkoutForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    if(!name || !phone || !address){ alert('Vui lòng nhập đầy đủ thông tin'); return; }
    localStorage.removeItem(CART_KEY);
    updateCartCount();
    const orderId = 'SD' + Date.now().toString().slice(-8);
    alert('Đặt hàng thành công! Mã đơn: ' + orderId + '\n(Trang demo - không có ship thật)');
    window.location.href = 'index.html';
  });

  const shippingSelect = document.getElementById('shippingMethod');
  shippingSelect.addEventListener('change', ()=> {
    // optional: could recalc if needed
  });
}
