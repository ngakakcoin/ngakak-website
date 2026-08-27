// ---------- store config ----------
const STORE_WALLET = "74wZfz9ZhiZPtw5H2o4pHCfCv7aCpgackh3d15kQZ9GK";

// Placeholder product catalog. Replace image/price/description with real ones later.
// image: use 'placeholder' for a generated color tile until real product photos are added.
const products = [
  { id: 'merch-hoodie', category: 'merch', price: 35,
    name_en: 'Ngakak Hoodie', name_id: 'Hoodie Ngakak',
    desc_en: 'Black hoodie with the yellow Ngakak crown logo. Same fit as the mascot.',
    desc_id: 'Hoodie hitam dengan logo mahkota Ngakak kuning. Model sama kayak yang dipakai mascot.' },
  { id: 'merch-tee', category: 'merch', price: 20,
    name_en: 'Ngakak Tee', name_id: 'Kaos Ngakak',
    desc_en: 'Classic black tee, front print, soft cotton.',
    desc_id: 'Kaos hitam klasik, sablon depan, bahan katun adem.' },
  { id: 'merch-cap', category: 'merch', price: 18,
    name_en: 'Ngakak Snapback Cap', name_id: 'Topi Snapback Ngakak',
    desc_en: 'Adjustable snapback with embroidered crown logo.',
    desc_id: 'Topi snapback adjustable dengan bordir logo mahkota.' },
  { id: 'merch-sticker', category: 'merch', price: 6,
    name_en: 'Ngakak Sticker Pack', name_id: 'Paket Stiker Ngakak',
    desc_en: 'Set of 5 vinyl stickers, weatherproof.',
    desc_id: 'Isi 5 stiker vinyl, tahan air dan cuaca.' },

  // --- Barang Khas Indonesia ---
  { id: 'id-batik-shirt', category: 'indonesia', price: 28,
    name_en: 'Batik Print Shirt', name_id: 'Kemeja Batik',
    desc_en: 'Handmade batik-print shirt, breathable cotton blend.',
    desc_id: 'Kemeja motif batik handmade, bahan katun adem.' },
  { id: 'id-kopi-gayo', category: 'indonesia', price: 15,
    name_en: 'Gayo Aceh Coffee (250g)', name_id: 'Kopi Gayo Aceh (250g)',
    desc_en: 'Single-origin arabica beans from Gayo highlands, Aceh.',
    desc_id: 'Biji kopi arabika single-origin dari dataran tinggi Gayo, Aceh.' },
  { id: 'id-garuda-keychain', category: 'indonesia', price: 8,
    name_en: 'Wooden Garuda Keychain', name_id: 'Gantungan Kunci Garuda Kayu',
    desc_en: 'Hand-carved wooden Garuda keychain, made by local artisans.',
    desc_id: 'Gantungan kunci Garuda kayu ukir tangan, buatan pengrajin lokal.' },
  { id: 'id-songket-wallet', category: 'indonesia', price: 22,
    name_en: 'Songket Wallet', name_id: 'Dompet Songket',
    desc_en: 'Handwoven songket fabric wallet with leather trim.',
    desc_id: 'Dompet kain songket tenun tangan dengan trim kulit.' },
];

const PLACEHOLDER_NOTE_EN = "Photo coming soon";
const PLACEHOLDER_NOTE_ID = "Foto segera hadir";

// ---------- cart helpers that need the product catalog ----------
function getCartItems(){
  const cart = getCart();
  return Object.keys(cart).map(id => {
    const p = products.find(pr => pr.id === id);
    if(!p) return null;
    return { ...p, qty: cart[id] };
  }).filter(Boolean);
}
function getCartTotal(){
  return getCartItems().reduce((sum, item) => sum + item.price * item.qty, 0);
}

// ---------- product tile builder (shared by store.html) ----------
function productImageEl(product){
  const wrap = document.createElement('div');
  wrap.className = 'product-img-placeholder';
  const lang = document.documentElement.getAttribute('data-lang') === 'id' ? 'id' : 'en';
  wrap.textContent = lang === 'id' ? PLACEHOLDER_NOTE_ID : PLACEHOLDER_NOTE_EN;
  return wrap;
}

function renderStoreGrid(filter){
  const grid = document.getElementById('storeGrid');
  if(!grid) return;
  const lang = document.documentElement.getAttribute('data-lang') === 'id' ? 'id' : 'en';
  grid.innerHTML = '';
  const list = filter && filter !== 'all' ? products.filter(p => p.category === filter) : products;
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.appendChild(productImageEl(p));
    const info = document.createElement('div');
    info.className = 'product-info';
    const name = document.createElement('h4');
    name.textContent = lang === 'id' ? p.name_id : p.name_en;
    const desc = document.createElement('p');
    desc.textContent = lang === 'id' ? p.desc_id : p.desc_en;
    const priceRow = document.createElement('div');
    priceRow.className = 'product-price-row';
    const price = document.createElement('span');
    price.className = 'product-price';
    price.textContent = `$${p.price} USDC`;
    const btn = document.createElement('button');
    btn.className = 'btn-primary product-add-btn';
    btn.textContent = lang === 'id' ? '+ Keranjang' : '+ Cart';
    btn.addEventListener('click', () => addToCart(p.id));
    priceRow.appendChild(price);
    priceRow.appendChild(btn);
    info.appendChild(name);
    info.appendChild(desc);
    info.appendChild(priceRow);
    card.appendChild(info);
    grid.appendChild(card);
  });
}

// category tab handling
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.store-tab');
  if(tabs.length){
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderStoreGrid(tab.getAttribute('data-filter'));
      });
    });
    renderStoreGrid('all');
  }
  updateCartBadge();
});

// re-render on language switch (store page + cart badge already text-only)
