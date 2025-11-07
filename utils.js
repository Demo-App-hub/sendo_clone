
window.formatVND = (n)=> (n||0).toLocaleString('vi-VN',{style:'currency', currency:'VND'});
window.getParam = (k)=> new URLSearchParams(window.location.search).get(k);
window.slugify = (s)=> s.normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^\w\s-]/g,'').trim().toLowerCase().replace(/[\s_-]+/g,'-');
window.renderStars = (r)=>{
  const full = Math.floor(r||0), half = (r - full)>=0.5 ? 1:0, empty = 5 - full - half;
  return '★'.repeat(full) + (half?'½':'') + '☆'.repeat(empty);
};
window.categoriesFromProducts = (products)=>{
  const set = new Set(products.map(p=>p.category));
  return Array.from(set);
};
window.scrollToSection = (id)=>{ document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); };
