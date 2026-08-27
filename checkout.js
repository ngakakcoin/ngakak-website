// Solana SPL token mint addresses (mainnet)
const TOKEN_MINTS = {
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
};

function currentCurrency(){
  const checked = document.querySelector('input[name="currency"]:checked');
  return checked ? checked.value : 'USDC';
}

function buildSolanaPayURI(amount, currency){
  const mint = TOKEN_MINTS[currency];
  const label = encodeURIComponent('Ngakak Store');
  const message = encodeURIComponent('Order payment');
  return `solana:${STORE_WALLET}?amount=${amount}&spl-token=${mint}&label=${label}&message=${message}`;
}

function updateQR(){
  const total = getCartTotal();
  const currency = currentCurrency();
  const qrImg = document.getElementById('payQR');
  const amountLabel = document.getElementById('payAmountLabel');
  if(!qrImg) return;
  if(total <= 0){
    qrImg.src = '';
    return;
  }
  const uri = buildSolanaPayURI(total, currency);
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(uri)}`;
  if(amountLabel) amountLabel.textContent = `${total} ${currency}`;
}

function renderCartSummary(){
  const summaryEl = document.getElementById('cartSummary');
  const payBox = document.getElementById('payBox');
  const orderForm = document.getElementById('orderForm');
  if(!summaryEl) return;
  const lang = document.documentElement.getAttribute('data-lang') === 'id' ? 'id' : 'en';
  const items = getCartItems();

  if(items.length === 0){
    summaryEl.innerHTML = `<div class="empty-cart">
      <p>${lang === 'id' ? translations.id.cart_empty : 'Your cart is empty.'}</p>
      <a href="store.html" class="btn-primary" style="margin-top:16px; display:inline-flex;">${lang === 'id' ? translations.id.cart_browse : 'Browse Store'}</a>
    </div>`;
    if(payBox) payBox.style.display = 'none';
    if(orderForm) orderForm.style.display = 'none';
    return;
  }

  if(payBox) payBox.style.display = '';
  if(orderForm) orderForm.style.display = '';

  summaryEl.innerHTML = '';
  items.forEach(item => {
    const line = document.createElement('div');
    line.className = 'cart-line';
    const name = document.createElement('span');
    name.className = 'cl-name';
    name.textContent = lang === 'id' ? item.name_id : item.name_en;
    const qtyBox = document.createElement('div');
    qtyBox.className = 'cl-qty';
    const minus = document.createElement('button');
    minus.textContent = '−';
    minus.addEventListener('click', () => { setQty(item.id, item.qty - 1); renderCartSummary(); updateQR(); });
    const qtyNum = document.createElement('span');
    qtyNum.textContent = item.qty;
    const plus = document.createElement('button');
    plus.textContent = '+';
    plus.addEventListener('click', () => { setQty(item.id, item.qty + 1); renderCartSummary(); updateQR(); });
    qtyBox.appendChild(minus);
    qtyBox.appendChild(qtyNum);
    qtyBox.appendChild(plus);
    const price = document.createElement('span');
    price.className = 'cl-price';
    price.textContent = `$${item.price * item.qty}`;
    line.appendChild(name);
    line.appendChild(qtyBox);
    line.appendChild(price);
    summaryEl.appendChild(line);
  });

  const totalRow = document.createElement('div');
  totalRow.className = 'cart-total-row';
  const totalLabel = document.createElement('span');
  totalLabel.textContent = lang === 'id' ? translations.id.cart_total : 'Total';
  const totalAmount = document.createElement('span');
  totalAmount.className = 'ct-amount';
  totalAmount.textContent = `$${getCartTotal()}`;
  totalRow.appendChild(totalLabel);
  totalRow.appendChild(totalAmount);
  summaryEl.appendChild(totalRow);

  // sync hidden order-items field
  const hiddenItems = document.getElementById('hiddenOrderItems');
  if(hiddenItems){
    const summary = items.map(i => `${i.qty}x ${i.name_en} ($${i.price} each)`).join(', ');
    hiddenItems.value = summary;
  }
  const hiddenTotal = document.getElementById('hiddenOrderTotal');
  if(hiddenTotal) hiddenTotal.value = String(getCartTotal());
}

document.addEventListener('DOMContentLoaded', () => {
  if(!document.getElementById('cartSummary')) return;
  renderCartSummary();
  updateQR();

  document.querySelectorAll('input[name="currency"]').forEach(radio => {
    radio.addEventListener('change', () => {
      updateQR();
      const hiddenCurrency = document.getElementById('hiddenOrderCurrency');
      if(hiddenCurrency) hiddenCurrency.value = currentCurrency();
    });
  });

  const copyBtn = document.getElementById('copyWalletBtn');
  if(copyBtn){
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(STORE_WALLET).then(() => {
        const lang = document.documentElement.getAttribute('data-lang') === 'id' ? 'id' : 'en';
        const original = copyBtn.textContent;
        copyBtn.textContent = lang === 'id' ? (translations.id.wallet_copied || 'Copied!') : 'Copied!';
        setTimeout(() => { copyBtn.textContent = original; }, 1500);
      });
    });
  }

  const orderForm = document.getElementById('orderForm');
  if(orderForm){
    orderForm.addEventListener('submit', async function(e){
      e.preventDefault();
      const lang = document.documentElement.getAttribute('data-lang') === 'id' ? 'id' : 'en';
      const msgEl = document.getElementById('orderMsg');
      const formData = new FormData(orderForm);
      try{
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString()
        });
        if(res.ok){
          msgEl.textContent = lang === 'id' ? translations.id.order_success : '✅ Order received! We\'ll verify payment and reach out about shipping.';
          msgEl.className = 'notify-msg success';
          orderForm.reset();
          saveCart({});
          renderCartSummary();
          updateQR();
        } else {
          throw new Error('Bad response');
        }
      } catch(err){
        msgEl.textContent = lang === 'id' ? translations.id.order_error : '⚠️ Something went wrong, please try again.';
        msgEl.className = 'notify-msg error';
      }
    });
  }
});
