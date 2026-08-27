// ---------- language toggle ----------
const originalEN = {};
const originalENPlaceholders = {};
document.querySelectorAll('[data-i18n]').forEach(el=>{
  originalEN[el.getAttribute('data-i18n')] = el.innerHTML;
});

function setLang(lang){
  document.documentElement.setAttribute('data-lang', lang);
  document.documentElement.setAttribute('lang', lang);
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(lang === 'en'){
      el.innerHTML = originalEN[key];
    } else {
      el.innerHTML = (translations.id[key] !== undefined) ? translations.id[key] : originalEN[key];
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const key = el.getAttribute('data-i18n-placeholder');
    if(!originalENPlaceholders[key]) originalENPlaceholders[key] = el.getAttribute('placeholder');
    if(lang === 'en'){
      el.setAttribute('placeholder', originalENPlaceholders[key]);
    } else {
      el.setAttribute('placeholder', translations.id[key] || originalENPlaceholders[key]);
    }
  });
  const btnEN = document.getElementById('btnEN');
  const btnID = document.getElementById('btnID');
  if(btnEN) btnEN.classList.toggle('active', lang==='en');
  if(btnID) btnID.classList.toggle('active', lang==='id');
  try{ localStorage.setItem('ngakak_lang', lang); }catch(e){}
  if(typeof renderMemeGrid === 'function') renderMemeGrid();
  if(typeof renderStoreGrid === 'function'){
    const activeTab = document.querySelector('.store-tab.active');
    renderStoreGrid(activeTab ? activeTab.getAttribute('data-filter') : 'all');
  }
}

const btnEN = document.getElementById('btnEN');
const btnID = document.getElementById('btnID');
if(btnEN) btnEN.addEventListener('click', ()=>setLang('en'));
if(btnID) btnID.addEventListener('click', ()=>setLang('id'));

// restore saved language preference on load
(function initLang(){
  let saved = null;
  try{ saved = localStorage.getItem('ngakak_lang'); }catch(e){}
  if(saved === 'id') setLang('id');
})();

// ---------- burger menu ----------
const burger = document.getElementById('burgerBtn');
const navLinks = document.getElementById('navLinks');
if(burger && navLinks){
  burger.addEventListener('click', ()=> navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> navLinks.classList.remove('open')));
}

// ---------- faq accordion ----------
document.querySelectorAll('.faq-item').forEach(item=>{
  const btn = item.querySelector('.faq-q');
  // Open by default so the answer is visible without clicking.
  item.classList.add('open');
  btn.setAttribute('aria-expanded','true');
  btn.addEventListener('click', ()=>{
    const wasOpen = item.classList.contains('open');
    if(wasOpen){
      item.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
    } else {
      item.classList.add('open');
      btn.setAttribute('aria-expanded','true');
    }
  });
});

// ---------- copy CA (placeholder until launch, community section on index.html) ----------
const caBtn = document.getElementById('copyCaBtn');
if(caBtn){
  caBtn.addEventListener('click', function(){
    const original = this.textContent;
    this.textContent = document.documentElement.getAttribute('data-lang')==='id' ? 'Belum ada' : 'Not live yet';
    setTimeout(()=> this.textContent = original, 1500);
  });
}

// ---------- copy dev wallet address (tokenomics.html transparency section) ----------
const devWalletBtn = document.getElementById('copyDevWalletBtn');
if(devWalletBtn){
  devWalletBtn.addEventListener('click', function(){
    const addr = "9sGG7oxTTTyJWqP5TDemvPSYCgLHWRrqUuZHbp8hJqTQ";
    navigator.clipboard.writeText(addr).then(() => {
      const lang = document.documentElement.getAttribute('data-lang') === 'id' ? 'id' : 'en';
      const original = this.textContent;
      this.textContent = lang === 'id' ? 'Tersalin!' : 'Copied!';
      setTimeout(() => { this.textContent = original; }, 1500);
    });
  });
}

// ---------- countdown to launch (Sept 25, 2026, 00:00 WIB = UTC+7) ----------
const launchDate = new Date('2026-09-25T00:00:00+07:00').getTime();
function updateCountdown(){
  const daysEl = document.getElementById('cd-days');
  if(!daysEl) return;
  const now = Date.now();
  const diff = Math.max(0, launchDate - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const pad = n => String(n).padStart(2,'0');
  daysEl.textContent = pad(d);
  document.getElementById('cd-hours').textContent = pad(h);
  document.getElementById('cd-mins').textContent = pad(m);
  document.getElementById('cd-secs').textContent = pad(s);
}
if(document.getElementById('cd-days')){
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// ---------- scroll reveal ----------
document.querySelectorAll('section').forEach(sec => sec.classList.add('reveal'));
document.querySelectorAll('.pillars, .steps, .token-grid').forEach(el => el.classList.add('reveal-stagger'));
const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => revealObserver.observe(el));

// ---------- active nav link on scroll ----------
const navSectionIds = ['why','lore','howtobuy','tokenomics','faq','memes','notify','community'];
const sectionsForNav = navSectionIds.map(id => document.getElementById(id)).filter(Boolean);
const navAnchors = {};
document.querySelectorAll('.navlinks a[href*="#"]').forEach(a=>{
  const hash = a.getAttribute('href').split('#')[1];
  if(hash) navAnchors[hash] = a;
});
if(sectionsForNav.length){
  const navObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      const link = navAnchors[entry.target.id];
      if(!link) return;
      if(entry.isIntersecting) {
        Object.values(navAnchors).forEach(a => a.classList.remove('active-link'));
        link.classList.add('active-link');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  sectionsForNav.forEach(sec => navObserver.observe(sec));
}

// ---------- back to top ----------
const backToTop = document.getElementById('backToTop');
if(backToTop){
  window.addEventListener('scroll', ()=>{
    backToTop.classList.toggle('show', window.scrollY > 600);
  });
  backToTop.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
}

// ---------- cart (localStorage-backed, shared across all pages) ----------
function getCart(){
  try{
    return JSON.parse(localStorage.getItem('ngakak_cart') || '{}');
  }catch(e){ return {}; }
}
function saveCart(cart){
  try{ localStorage.setItem('ngakak_cart', JSON.stringify(cart)); }catch(e){}
  updateCartBadge();
}
function addToCart(id){
  const cart = getCart();
  cart[id] = (cart[id] || 0) + 1;
  saveCart(cart);
  if(typeof showToast === 'function'){
    const lang = document.documentElement.getAttribute('data-lang') === 'id' ? 'id' : 'en';
    showToast(lang === 'id' ? 'Ditambahkan ke keranjang' : 'Added to cart');
  }
}
function removeFromCart(id){
  const cart = getCart();
  delete cart[id];
  saveCart(cart);
}
function setQty(id, qty){
  const cart = getCart();
  if(qty <= 0){ delete cart[id]; } else { cart[id] = qty; }
  saveCart(cart);
}
function getCartCount(){
  const cart = getCart();
  return Object.values(cart).reduce((a,b) => a+b, 0);
}
function updateCartBadge(){
  const badge = document.getElementById('cartBadge');
  if(!badge) return;
  const count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline-flex' : 'none';
}
updateCartBadge();

// ---------- toast helper ----------
function showToast(msg){
  const toast = document.getElementById('toast');
  if(!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> toast.classList.remove('show'), 2200);
}

// ---------- mascot tilt on mousemove (desktop) ----------
const mascotTilt = document.getElementById('mascotTilt');
const heroVisual = document.querySelector('.hero-visual');
if(mascotTilt && heroVisual && window.matchMedia('(hover: hover)').matches){
  heroVisual.addEventListener('mousemove', (e)=>{
    const rect = heroVisual.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mascotTilt.style.transform = `rotateY(${x*14}deg) rotateX(${-y*14}deg)`;
  });
  heroVisual.addEventListener('mouseleave', ()=>{
    mascotTilt.style.transform = 'rotateY(0) rotateX(0)';
  });
}

// ---------- mascot click easter egg ----------
const laughLines = {
  en: ["HAHAHA! You clicked me!", "No stress detected. Good.", "Ngakak level: MAXIMUM.", "Beep boop. Still funny.", "Warning: too much fun ahead.", "I was born to make you smile.", "Green candles? Never heard of her.", "Just vibing, one click at a time."],
  id: ["HAHAHA! Lo klik gue!", "Stress level: nol. Mantap.", "Level ngakak: MAKSIMAL.", "Beep boop. Masih lucu.", "Awas: kebanyakan ketawa di depan.", "Gue lahir buat bikin lo senyum.", "Candle hijau? Ga kenal tuh.", "Santuy aja, satu klik satu waktu."]
};
if(mascotTilt){
  mascotTilt.addEventListener('click', ()=>{
    const lang = document.documentElement.getAttribute('data-lang') === 'id' ? 'id' : 'en';
    const lines = laughLines[lang];
    const line = lines[Math.floor(Math.random()*lines.length)];
    const bubble = document.getElementById('speechBubble');
    if(!bubble) return;
    bubble.textContent = line;
    bubble.classList.add('show');
    clearTimeout(bubble._t);
    bubble._t = setTimeout(()=> bubble.classList.remove('show'), 2200);
  });
}

// ---------- meme gallery ----------
// To add a new meme: 1) put the image file in the assets/ folder,
// 2) add a new line below with its filename + captions.
const memeData = [
  { img: 'mascot-full.webp', en: "when the chart is red but ur portfolio is memes", id: "pas chart merah tapi portofolio isinya meme" },
  { img: 'mascot-logo.webp', en: "no stress. just ngakak. that's the whole plan", id: "no stress. cuma ngakak. itu doang rencananya" },
  { img: 'mascot-full.webp', en: "me explaining $NGAKAK to my mom", id: "gue jelasin $NGAKAK ke nyokap" },
  { img: 'mascot-logo.webp', en: "day 1 of the ngakak army", id: "hari ke-1 pasukan ngakak" },
  { img: 'mascot-full.webp', en: "fair launch gang rise up", id: "fair launch gang bangkit" },
  { img: 'mascot-logo.webp', en: "still not selling. still laughing.", id: "masih belum jual. masih ketawa." },
  { img: 'meme-mascot-baseline.png', en: "new baseline mascot just dropped, still no stress", id: "mascot baseline baru rilis, masih no stress" },
  { img: 'meme-x-profile-icon.png', en: "new pfp who dis (still pointing at you to laugh)", id: "ganti pp siapa ini (masih nunjuk lo suruh ngakak)" },
];

function renderMemeGrid(){
  const grid = document.getElementById('memeGrid');
  if(!grid) return;
  const lang = document.documentElement.getAttribute('data-lang') === 'id' ? 'id' : 'en';
  grid.innerHTML = '';
  memeData.forEach((m) => {
    const card = document.createElement('div');
    card.className = 'meme-card';
    const img = document.createElement('img');
    img.src = 'assets/' + m.img;
    img.alt = 'Ngakak meme';
    img.loading = 'lazy';
    const cap = document.createElement('div');
    cap.className = 'meme-caption';
    cap.textContent = m[lang];
    card.appendChild(img);
    card.appendChild(cap);
    card.addEventListener('click', () => openLightbox(img.src, m[lang]));
    grid.appendChild(card);
  });
  const moreCard = document.createElement('div');
  moreCard.className = 'meme-card more-card';
  const moreSpan = document.createElement('span');
  moreSpan.textContent = lang === 'id' ? '+ Lebih banyak segera' : '+ More coming soon';
  moreCard.appendChild(moreSpan);
  grid.appendChild(moreCard);
}

let lightboxEl = null;
function openLightbox(src, caption){
  if(!lightboxEl){
    lightboxEl = document.createElement('div');
    lightboxEl.className = 'meme-lightbox';
    lightboxEl.innerHTML = `
      <button class="meme-lightbox-close" aria-label="Close">×</button>
      <div class="meme-lightbox-inner">
        <img alt="Ngakak meme">
        <div class="meme-lightbox-caption"></div>
      </div>`;
    document.body.appendChild(lightboxEl);
    lightboxEl.querySelector('.meme-lightbox-close').addEventListener('click', closeLightbox);
    lightboxEl.addEventListener('click', (e) => { if(e.target === lightboxEl) closeLightbox(); });
  }
  lightboxEl.querySelector('img').src = src;
  lightboxEl.querySelector('.meme-lightbox-caption').textContent = caption;
  lightboxEl.classList.add('show');
}
function closeLightbox(){
  if(lightboxEl) lightboxEl.classList.remove('show');
}
renderMemeGrid();

// ---------- notify me form (Netlify Forms, AJAX submit) ----------
const notifyForm = document.getElementById('notifyForm');
if(notifyForm){
  notifyForm.addEventListener('submit', async function(e){
    e.preventDefault();
    const lang = document.documentElement.getAttribute('data-lang') === 'id' ? 'id' : 'en';
    const msgEl = document.getElementById('notifyMsg');
    const formData = new FormData(notifyForm);
    try{
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      });
      if(res.ok){
        msgEl.textContent = lang === 'id' ? '✅ Sip, kamu bakal diingetin pas launch!' : "✅ You're in! We'll ping you at launch.";
        msgEl.className = 'notify-msg success';
        notifyForm.reset();
      } else {
        throw new Error('Bad response');
      }
    } catch(err){
      msgEl.textContent = lang === 'id' ? '⚠️ Gagal kirim, coba lagi ya.' : '⚠️ Something went wrong, please try again.';
      msgEl.className = 'notify-msg error';
    }
  });
}
