document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const UPI_ID = 'harshithiranwal@oksbi';         // !!! REPLACE WITH YOUR UPI ID !!!
    const SHOP_WHATSAPP_NUMBER = '918299188579'; // !!! REPLACE WITH YOUR WHATSAPP NUMBER (with country code) !!!
    const MERCHANT_NAME = 'Luxe Beauty';
    const TAX_RATE = 0.05;

    // --- PRODUCT DATA (Update with your own products) ---
    const products = [
        { id: 1, name: 'Hydrating Serum', originalPrice: 2200, price: 1850, image: 'hydratingserum.jpg', category: 'skincare' },
        { id: 2, name: 'Vitamin C Cleanser', originalPrice: 1500, price: 1200, image: 'vitaminc.jpg', category: 'skincare' },
        { id: 3, name: 'Rose Water Toner', originalPrice: 1150, price: 950, image: 'rose-water.jpg', category: 'skincare' },
        { id: 4, name: 'Sunscreen SPF 50', originalPrice: 899, price: 750, image: 'sunscreen.jpg', category: 'skincare' },
        { id: 5, name: 'Velvet Matte Lipstick', originalPrice: 1100, price: 899, image: 'lipstick.jpg', category: 'makeup' },
        { id: 6, name: 'HD Liquid Foundation', originalPrice: 1950, price: 1600, image: 'hd-foundation.jpg', category: 'makeup' },
        { id: 7, name: 'Waterproof Mascara', originalPrice: 800, price: 650, image: 'mascara.jpg', category: 'makeup' },
        { id: 8, name: 'Shimmering Eyeshadow', originalPrice: 1400, price: 1100, image: 'eyeshadow.jpg', category: 'makeup' }
    ];

    // --- STATE ---
    let bag = [];
    
    // --- DOM ELEMENTS ---
    const qrModalOverlay = document.getElementById('qr-modal-overlay');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const qrcodeContainer = document.getElementById('qrcode-container');
    const qrAmount = document.getElementById('qr-amount');
    const whatsappLinkBtn = document.getElementById('whatsapp-link-btn');
    const productGrid = document.querySelector('.product-grid');
    const productGridMakeup = document.querySelector('.product-grid-makeup');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const countdownTimerEl = document.getElementById('countdown-timer');
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
    
    function handleFinalPayment(event) {
        event.preventDefault(); 
        if (!validateAddressForm()) return;
        const formData = new FormData(addressForm);
        const shippingAddress = Object.fromEntries(formData.entries());
        const totalAmount = parseFloat(finalTotalEl.textContent.replace('₹', ''));
        const transactionNote = `Order from ${shippingAddress.name}`;
        const upiString = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
        let message = `🎉 *New Order from Luxe Beauty!* 🎉\n\n`;
        message += `*Customer Details:*\n`;
        message += `Name: ${shippingAddress.name}\n`;
        message += `Phone: ${shippingAddress.phone}\n`;
        message += `Address: ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.pincode}\n\n`;
        message += `*Order Items:*\n`;
        bag.forEach(item => {
            message += `- ${item.name} (₹${item.price.toFixed(2)})\n`;
        });
        message += `\n*Final Amount:* ₹${totalAmount.toFixed(2)}\n\n`;
        message += `_(Please send the QR code screenshot to confirm order)_`;
        const whatsappUrl = `https://wa.me/${SHOP_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        
        qrcodeContainer.innerHTML = '';
        new QRCode(qrcodeContainer, {
            text: upiString,
            width: 200, height: 200,
            colorDark: "#000000", colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        qrAmount.textContent = `Total to Pay: ₹${totalAmount.toFixed(2)}`;
        whatsappLinkBtn.href = whatsappUrl;
        qrModalOverlay.style.display = 'flex';
    }
    
    function hideModal() {
        qrModalOverlay.style.display = 'none';
    }

    function startDealTimer(durationInMinutes) {
        let timer = durationInMinutes * 60;
        const intervalId = setInterval(() => {
            if (timer <= 0) {
                clearInterval(intervalId);
                countdownTimerEl.innerHTML = "Deal Ended!";
                countdownTimerEl.classList.add('ended');
                document.querySelectorAll('.add-to-bag-btn:not(.added)').forEach(btn => {
                    btn.disabled = true;
                    btn.textContent = 'Deal Over';
                });
                return;
            }
            timer--;
            const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
            const seconds = String(timer % 60).padStart(2, '0');
            minutesEl.textContent = minutes;
            secondsEl.textContent = seconds;
        }, 1000);
    }
    
    function renderProducts() {
        products.forEach(product => {
            const grid = product.category === 'skincare' ? productGrid : productGridMakeup;
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.id = product.id;
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <div class="price-container">
                    <span class="original-price">₹${product.originalPrice.toFixed(2)}</span>
                    <span class="deal-price">₹${product.price.toFixed(2)}</span>
                </div>
                <button class="add-to-bag-btn">Add to Bag</button>`;
            grid.appendChild(card);
        });
    }

    function addToBag(productId) {
        if (bag.some(item => item.id === productId)) return;
        const product = products.find(p => p.id === productId);
        bag.push(product);
        updateUI();
    }

    function removeFromBag(productId) {
        bag = bag.filter(item => item.id !== productId);
        updateUI();
    }

    function updateUI() {
        updateBagDisplay();
        updateSummary();
        updateAddToBagButtons();
        updateBagCount();
    }

    function updateSummary() {
        const subtotal = bag.reduce((sum, item) => sum + item.price, 0);
        const taxes = subtotal * TAX_RATE;
        const total = subtotal + taxes;
        subtotalPriceEl.textContent = `₹${subtotal.toFixed(2)}`;
        taxesPriceEl.textContent = `₹${taxes.toFixed(2)}`;
        totalPriceBagEl.textContent = `₹${total.toFixed(2)}`;
        finalSubtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
        finalTotalEl.textContent = `₹${total.toFixed(2)}`;
        checkoutBtn.classList.toggle('disabled', total === 0);
    }
    
    function updateAddToBagButtons() {
        document.querySelectorAll('.add-to-bag-btn').forEach(button => {
            const productId = parseInt(button.closest('.product-card').dataset.id);
            const isInBag = bag.some(item => item.id === productId);
            const isDealOver = countdownTimerEl.classList.contains('ended');
            
            button.classList.toggle('added', isInBag);
            button.disabled = isInBag || (!isInBag && isDealOver);
            
            if (isInBag) {
                button.textContent = '✓ Added';
            } else if (isDealOver) {
                button.textContent = 'Deal Over';
            } else {
                button.textContent = 'Add to Bag';
            }
        });
    }

    function updateBagCount() {
        bagCountEl.textContent = bag.length;
    }

    function updateBagDisplay() {
        if (bag.length === 0) {
            bagItemsContainer.innerHTML = '<p class="empty-bag-message">Your bag is empty.</p>';
        } else {
            bagItemsContainer.innerHTML = bag.map(item => `
                <div class="bag-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <p>₹${item.price.toFixed(2)}</p>
                    </div>
                    <button class="remove-item-btn" data-id="${item.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>`).join('');
        }
    }
    
    function validateAddressForm() {
        let isValid = true;
        formErrorMsg.style.display = 'none';
        addressForm.querySelectorAll('input[required]').forEach(input => {
            input.classList.remove('invalid');
            if (input.value.trim() === '' || (input.pattern && !new RegExp(input.pattern).test(input.value))) {
                isValid = false;
                input.classList.add('invalid');
            }
        });
        if (!isValid) {
            formErrorMsg.textContent = 'Please fill all required fields correctly.';
            formErrorMsg.style.display = 'block';
        }
        return isValid;
    }
    
    function switchPage(pageName) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`${pageName}-page`).classList.add('active');
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        if (pageName === 'home') {
            navHomeBtn.classList.add('active');
        } else {
            navBagBtn.classList.add('active');
            if(pageName === 'bag') updateUI();
        }
    }

    // --- EVENT LISTENERS ---
    
    document.querySelector('.container').addEventListener('click', e => {
        if (e.target.classList.contains('add-to-bag-btn')) {
            addToBag(parseInt(e.target.closest('.product-card').dataset.id));
        }
        if (e.target.closest('.remove-item-btn')) {
            removeFromBag(parseInt(e.target.closest('.remove-item-btn').dataset.id));
        }
    });
    
    navHomeBtn.addEventListener('click', () => switchPage('home'));
    navBagBtn.addEventListener('click', () => switchPage('bag'));
    checkoutBtn.addEventListener('click', () => { if (bag.length > 0) switchPage('address'); });
    backToBagBtn.addEventListener('click', () => switchPage('bag'));
    
    addressForm.addEventListener('submit', handleFinalPayment);
    closeModalBtn.addEventListener('click', hideModal);
    qrModalOverlay.addEventListener('click', (e) => {
        if (e.target === qrModalOverlay) hideModal();
    });

    // --- INITIALIZATION ---
    renderProducts();
    switchPage('home');
    startDealTimer(30);
});
