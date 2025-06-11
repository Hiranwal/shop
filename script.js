document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const UPI_ID = 'harshithiranwal@oksbi'; // !!! REPLACE WITH YOUR UPI ID !!!
    const MERCHANT_NAME = 'Luxe Beauty';
    const TAX_RATE = 0.05; // 5% tax

    // --- PRODUCT DATA WITH ORIGINAL AND DEAL PRICES ---
    // 'price' is the deal price and will be used for calculations.
    // 'originalPrice' is for display only.
    const products = [
        { id: 1, name: 'Hydrating Serum', originalPrice: 540, price: 50, image: 'hydratingserum.jpg', category: 'skincare' },
        { id: 2, name: 'Vitamin C Cleanser', originalPrice: 350, price: 20, image: 'vitaminc.jpg', category: 'skincare' },
        { id: 3, name: 'Rose Water Toner', originalPrice: 750, price: 40, image: 'rose-water.jpg', category: 'skincare' },
        { id: 4, name: 'Sunscreen SPF 50', originalPrice: 899, price: 50, image: 'sunscreen.jpg', category: 'skincare' },
        { id: 5, name: 'Velvet Matte Lipstick', originalPrice: 600, price: 25, image: 'lipstick.jpg', category: 'makeup' },
        { id: 6, name: 'HD Liquid Foundation', originalPrice: 950, price: 60, image: 'hd-foundation.jpg', category: 'makeup' },
        { id: 7, name: 'Waterproof Mascara', originalPrice: 800, price: 20, image: 'mascara.jpg', category: 'makeup' },
        { id: 8, name: 'Shimmering Eyeshadow', originalPrice: 500, price: 15, image: 'eyeshadow.jpg', category: 'makeup' }
    ];
    
    // --- STATE ---
    let bag = [];
    let shippingAddress = {};
    
    // --- DOM ELEMENTS ---
    // ( ... existing DOM elements are the same ... )
    // **** NEW TIMER ELEMENTS ****
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const countdownTimerEl = document.getElementById('countdown-timer');

    // (The rest of the DOM elements are the same as the previous version)
    const productGrid = document.querySelector('.product-grid');
    const productGridMakeup = document.querySelector('.product-grid-makeup');
    const bagItemsContainer = document.getElementById('bag-items-container');
    const subtotalPriceEl = document.getElementById('subtotal-price');
    const taxesPriceEl = document.getElementById('taxes-price');
    const totalPriceBagEl = document.getElementById('total-price-bag');
    const bagCountEl = document.querySelector('.bag-count');
    const homePage = document.getElementById('home-page');
    const bagPage = document.getElementById('bag-page');
    const addressPage = document.getElementById('address-page');
    const navHomeBtn = document.getElementById('nav-home');
    const navBagBtn = document.getElementById('nav-bag');
    const checkoutBtn = document.getElementById('checkout-btn');
    const backToBagBtn = document.getElementById('back-to-bag-btn');
    const addressForm = document.getElementById('address-form');
    const finalSubtotalEl = document.getElementById('final-subtotal');
    const finalTotalEl = document.getElementById('final-total');
    const formErrorMsg = document.getElementById('form-error-msg');


    // --- FUNCTIONS ---
    
    // **** MODIFIED renderProducts function ****
    function renderProducts() {
        products.forEach(product => {
            const grid = product.category === 'skincare' ? productGrid : productGridMakeup;
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.id = product.id;
            
            // This now includes the original and deal price display
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <div class="price-container">
                    <span class="original-price">₹${product.originalPrice.toFixed(2)}</span>
                    <span class="deal-price">₹${product.price.toFixed(2)}</span>
                </div>
                <button class="add-to-bag-btn">Add to Bag</button>
            `;
            grid.appendChild(card);
        });
    }

    // **** NEW Countdown Timer Function ****
    function startDealTimer(durationInMinutes) {
        let timer = durationInMinutes * 60;
        
        const intervalId = setInterval(() => {
            const minutes = Math.floor(timer / 60);
            const seconds = timer % 60;

            minutesEl.textContent = String(minutes).padStart(2, '0');
            secondsEl.textContent = String(seconds).padStart(2, '0');
            
            if (--timer < 0) {
                clearInterval(intervalId);
                countdownTimerEl.innerHTML = "Deal Ended!";
                countdownTimerEl.classList.add('ended');
                // Optional: disable all "Add to Bag" buttons when the deal ends
                document.querySelectorAll('.add-to-bag-btn').forEach(btn => {
                    btn.disabled = true;
                    btn.textContent = 'Deal Over';
                });
            }
        }, 1000);
    }

    // --- (The rest of the functions like addToBag, removeFromBag, updateSummary, etc., remain exactly the same.
    // --- The logic correctly uses 'product.price' for calculations, so no changes are needed there.)

    function addToBag(productId) { if (bag.some(item => item.id === productId)) return; const product = products.find(p => p.id === productId); bag.push(product); updateUI(); }
    function removeFromBag(productId) { bag = bag.filter(item => item.id !== productId); updateUI(); }
    function updateAddToBagButtons() { const buttons = document.querySelectorAll('.add-to-bag-btn'); buttons.forEach(button => { const card = button.closest('.product-card'); const productId = parseInt(card.dataset.id); if (bag.some(item => item.id === productId)) { button.textContent = '✓ Added'; button.classList.add('added'); button.disabled = true; } else { button.textContent = 'Add to Bag'; button.classList.remove('added'); button.disabled = false; } }); }
    function updateBagCount() { bagCountEl.textContent = bag.length; }
    function updateBagDisplay() { bagItemsContainer.innerHTML = ''; if (bag.length === 0) { bagItemsContainer.innerHTML = '<p class="empty-bag-message">Your bag is empty.</p>'; return; } bag.forEach(item => { const itemEl = document.createElement('div'); itemEl.className = 'bag-item'; itemEl.innerHTML = ` <img src="${item.image}" alt="${item.name}"> <div class="item-details"> <h3>${item.name}</h3> <p>₹${item.price.toFixed(2)}</p> </div> <button class="remove-item-btn" data-id="${item.id}"> <i class="fas fa-trash-alt"></i> </button> `; bagItemsContainer.appendChild(itemEl); }); }
    function updateSummary() { const subtotal = bag.reduce((sum, item) => sum + item.price, 0); const taxes = subtotal * TAX_RATE; const total = subtotal + taxes; subtotalPriceEl.textContent = `₹${subtotal.toFixed(2)}`; taxesPriceEl.textContent = `₹${taxes.toFixed(2)}`; totalPriceBagEl.textContent = `₹${total.toFixed(2)}`; finalSubtotalEl.textContent = `₹${subtotal.toFixed(2)}`; finalTotalEl.textContent = `₹${total.toFixed(2)}`; if (total > 0) { checkoutBtn.classList.remove('disabled'); } else { checkoutBtn.classList.add('disabled'); } }
    function updateUI() { updateBagDisplay(); updateSummary(); updateAddToBagButtons(); updateBagCount(); }
    function validateAddressForm() { let isValid = true; formErrorMsg.style.display = 'none'; const inputs = addressForm.querySelectorAll('input[required]'); inputs.forEach(input => { if (input.value.trim() === '' || (input.pattern && !new RegExp(input.pattern).test(input.value))) { isValid = false; input.classList.add('invalid'); } else { input.classList.remove('invalid'); } }); if (!isValid) { formErrorMsg.textContent = 'Please fill all required fields correctly.'; formErrorMsg.style.display = 'block'; } return isValid; }
    function handleFinalPayment(event) { event.preventDefault(); if (!validateAddressForm()) { return; } const formData = new FormData(addressForm); shippingAddress = Object.fromEntries(formData.entries()); const totalAmount = parseFloat(finalTotalEl.textContent.replace('₹', '')); const transactionNote = `Order from Luxe Beauty for ${shippingAddress.name}`; const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`; window.location.href = upiUrl; }
    function switchPage(page) { [homePage, bagPage, addressPage].forEach(p => p.classList.remove('active')); [navHomeBtn, navBagBtn].forEach(b => b.classList.remove('active')); if (page === 'home') { homePage.classList.add('active'); navHomeBtn.classList.add('active'); } else if (page === 'bag') { bagPage.classList.add('active'); navBagBtn.classList.add('active'); updateUI(); } else if (page === 'address') { addressPage.classList.add('active'); navBagBtn.classList.add('active'); } }

    // --- EVENT LISTENERS (All remain the same) ---
    document.querySelector('.container').addEventListener('click', e => { if (e.target.classList.contains('add-to-bag-btn')) { const card = e.target.closest('.product-card'); const productId = parseInt(card.dataset.id); addToBag(productId); } });
    bagItemsContainer.addEventListener('click', e => { if (e.target.closest('.remove-item-btn')) { const button = e.target.closest('.remove-item-btn'); const productId = parseInt(button.dataset.id); removeFromBag(productId); } });
    navHomeBtn.addEventListener('click', () => switchPage('home'));
    navBagBtn.addEventListener('click', () => switchPage('bag'));
    checkoutBtn.addEventListener('click', () => { if(bag.length > 0) switchPage('address'); });
    backToBagBtn.addEventListener('click', () => switchPage('bag'));
    addressForm.addEventListener('submit', handleFinalPayment);


    // --- INITIALIZATION ---
    renderProducts();
    switchPage('home');
    updateBagCount();
    startDealTimer(30); // Start a 30-minute countdown timer!
});