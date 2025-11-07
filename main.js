
document.addEventListener('DOMContentLoaded', ()=>{
  updateCartCount();
  fillCategoryMenu();
  if(document.getElementById('featuredCategories')) renderFeaturedCategories();
  if(document.getElementById('flashSaleRow')) renderFlashSale();
  if(document.getElementById('suggestRow')) renderSuggest();
  startCountdown();
});

function fillCategoryMenu(){
  const menu = document.getElementById('categoryMenu');
  if(!menu) return;
  const cats = categoriesFromProducts(PRODUCTS);
  menu.innerHTML = cats.map(c=> `<li><a class="dropdown-item" href="category.html?cat=${encodeURIComponent(c)}">${c}</a></li>`).join('')
    + '<li><hr class="dropdown-divider"></li><li><a class="dropdown-item" href="category.html?cat=Tất%20cả">Tất cả</a></li>';
}

function renderFeaturedCategories(){
  const wrap = document.getElementById('featuredCategories');
  const cats = categoriesFromProducts(PRODUCTS).slice(0,6);
  wrap.innerHTML = cats.map((c,i)=>`
    <div class="col-6 col-md-4 col-lg-2">
      <a href="category.html?cat=${encodeURIComponent(c)}" class="text-decoration-none">
        <div class="card text-center card-product">
          <img src="https://picsum.photos/seed/cat${i}/200/200" class="rounded-top" alt="${c}">
          <div class="card-body small">${c}</div>
        </div>
      </a>
    </div>`).join('');
}

function cardHtml(p){
  const price = p.salePrice || p.price;
  const saleHtml = p.salePrice ? `<span class="price-old ms-2">${formatVND(p.price)}</span>` : '';
  const saleBadge = p.salePrice ? `<span class="badge badge-sale position-absolute m-2">- ${Math.round(100 - (p.salePrice/p.price)*100)}%</span>` : '';
  return `
  <div class="col-6 col-md-4 col-lg-3">
    <div class="card card-product h-100 position-relative">
      ${saleBadge}
      <a href="product.html?id=${p.id}"><img src="${p.image}" class="card-img-top product-img" alt="${p.name}"></a>
      <div class="card-body d-flex flex-column">
        <a class="text-decoration-none text-dark fw-semibold line-clamp-2" href="product.html?id=${p.id}">${p.name}</a>
        <div class="small text-muted">${p.category}</div>
        <div class="rating small mt-1">${renderStars(p.rating)}</div>
        <div class="mt-auto d-flex align-items-center justify-content-between">
          <div class="price">${formatVND(price)} ${saleHtml}</div>
          <button class="btn btn-sm btn-outline-danger" onclick="addToCart(${p.id})"><i class="fa fa-cart-plus"></i></button>
        </div>
      </div>
    </div>
  </div>`;
}

function renderFlashSale(){
  const wrap = document.getElementById('flashSaleRow');
  const items = PRODUCTS.filter(p=> p.salePrice && p.salePrice>0).slice(0,8);
  wrap.innerHTML = items.map(cardHtml).join('');
}

function renderSuggest(){
  const wrap = document.getElementById('suggestRow');
  const items = PRODUCTS.slice(0,12);
  wrap.innerHTML = items.map(cardHtml).join('');
}

function startCountdown(){
  const el = document.getElementById('flashCountdown');
  if(!el) return;
  // Set countdown to end at the next 23:00 today
  const now = new Date();
  const end = new Date(now);
  end.setHours(23,0,0,0);
  if(end < now) end.setDate(end.getDate()+1);
  const tick = ()=>{
    const diff = Math.max(0, end - new Date());
    const h = Math.floor(diff/3600000), m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
    el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };
  tick(); setInterval(tick, 1000);
}

// Category page logic
function renderCategoryPage(){
  const cat = getParam('cat') || 'Tất cả';
  document.getElementById('catTitle').textContent = cat;
  const ratingFilter = document.getElementById('ratingFilter');
  const minPrice = document.getElementById('minPrice');
  const maxPrice = document.getElementById('maxPrice');
  const sortSel = document.getElementById('sortSelect');
  const applyBtn = document.getElementById('applyFilterBtn');

  let page = 1, perPage = 12;

  function apply(){
    let arr = PRODUCTS.slice();
    if(cat !== 'Tất cả') arr = arr.filter(p=> p.category === cat);
    const min = parseInt(minPrice.value||0), max = parseInt(maxPrice.value||0);
    if(min) arr = arr.filter(p=> (p.salePrice||p.price) >= min);
    if(max) arr = arr.filter(p=> (p.salePrice||p.price) <= max);
    const rate = parseInt(ratingFilter.value||0);
    if(rate) arr = arr.filter(p=> p.rating >= rate);
    switch(sortSel.value){
      case 'priceAsc': arr.sort((a,b)=> (a.salePrice||a.price)-(b.salePrice||b.price)); break;
      case 'priceDesc': arr.sort((a,b)=> (b.salePrice||b.price)-(a.salePrice||a.price)); break;
      case 'ratingDesc': arr.sort((a,b)=> b.rating - a.rating); break;
    }
    render(arr);
  }

  function render(list){
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total/perPage));
    page = Math.min(page, totalPages);
    const start = (page-1)*perPage, end = start+perPage;
    const pageItems = list.slice(start, end);
    document.getElementById('categoryRow').innerHTML = pageItems.map(cardHtml).join('');
    renderPagination(totalPages);
  }

  function renderPagination(totalPages){
    const ul = document.getElementById('pagination');
    const items = [];
    function li(disabled, active, label, p){
      items.push(`<li class="page-item ${disabled?'disabled':''} ${active?'active':''}"><a class="page-link" href="#" data-p="${p}">${label}</a></li>`)
    }
    li(page===1,false,'«',page-1);
    for(let i=1;i<=totalPages;i++) li(false, i===page, i, i);
    li(page===totalPages,false,'»',page+1);
    ul.innerHTML = items.join('');
    ul.querySelectorAll('a').forEach(a=> a.addEventListener('click', (e)=>{ e.preventDefault(); const p = parseInt(a.dataset.p); if(p>=1 && p<=totalPages){ page=p; apply(); }}));
  }

  applyBtn.addEventListener('click', ()=> { page=1; apply(); });
  sortSel.addEventListener('change', ()=> { page=1; apply(); });
  apply();
}

// Product page
function renderProductPage(){
  const id = parseInt(getParam('id'));
  const p = PRODUCTS.find(x=> x.id === id);
  const wrap = document.getElementById('productDetail');
  if(!p){ wrap.innerHTML = '<div class="alert alert-danger">Không tìm thấy sản phẩm.</div>'; return; }
  const price = p.salePrice || p.price;
  wrap.innerHTML = `
  <div class="row g-4">
    <div class="col-md-5">
      <img src="${p.image}" class="w-100 rounded shadow-sm" alt="${p.name}">
    </div>
    <div class="col-md-7">
      <h4>${p.name}</h4>
      <div class="small text-muted mb-2">${p.category}</div>
      <div class="rating mb-2">${renderStars(p.rating)}</div>
      <div class="h4 text-danger">${formatVND(price)} ${p.salePrice?`<span class="price-old h6 ms-2">${formatVND(p.price)}</span>`:''}</div>
      <p class="mt-3">${p.description}</p>
      <div class="d-flex align-items-center gap-2">
        <input type="number" id="qty" min="1" value="1" class="form-control" style="width:120px">
        <button class="btn btn-danger" onclick="addToCart(${p.id}, parseInt(document.getElementById('qty').value||1))"><i class="fa fa-cart-plus me-1"></i>Thêm vào giỏ</button>
        <a class="btn btn-outline-danger" href="cart.html">Xem giỏ hàng</a>
      </div>
      <div class="mt-3">Tồn kho: <strong>${p.stock}</strong></div>
      <div class="mt-2">Tags: ${p.tags.map(t=> `<span class="badge text-bg-light me-1">${t}</span>`).join('')}</div>
    </div>
  </div>`;

  const related = PRODUCTS.filter(x=> x.category===p.category && x.id!==p.id).slice(0,8);
  document.getElementById('relatedRow').innerHTML = related.map(cardHtml).join('');
}

// Search page
function renderSearchPage(){
  const q = (getParam('q')||'').trim();
  document.getElementById('queryText').textContent = q || '(trống)';
  let list = PRODUCTS.slice();
  if(q){
    const s = slugify(q);
    list = list.filter(p=> slugify(p.name).includes(s) || slugify(p.category).includes(s) || p.tags.some(t=> slugify(t).includes(s)));
  }
  document.getElementById('resultCount').textContent = list.length + ' kết quả';
  document.getElementById('searchRow').innerHTML = list.map(cardHtml).join('');
}
