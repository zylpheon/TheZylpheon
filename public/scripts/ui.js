function setupEventListeners() {
    document.getElementById('loginBtn')?.addEventListener('click', () => {
        document.getElementById('loginModal').classList.add('active');
    });
    document.getElementById('closeLogin')?.addEventListener('click', () => {
        document.getElementById('loginModal').classList.remove('active');
    });
    document.getElementById('showRegister')?.addEventListener('click', () => {
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('registerModal').classList.add('active');
    });
    document.getElementById('showLogin')?.addEventListener('click', () => {
        document.getElementById('registerModal').classList.remove('active');
        document.getElementById('loginModal').classList.add('active');
    });
    document.getElementById('closeRegister')?.addEventListener('click', () => {
        document.getElementById('registerModal').classList.remove('active');
    });
    document.getElementById('cartBtn')?.addEventListener('click', () => {
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.style.display = 'flex';
            cartModal.classList.add('active');
            displayCartItems();
        }
    });
    const closeCartBtn = document.getElementById('closeCart');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', (e) => {
            console.log('Close cart clicked');
            e.preventDefault();
            e.stopPropagation();
            const cartModal = document.getElementById('cartModal');
            if (cartModal) {
                cartModal.style.display = 'none';
                cartModal.classList.remove('active');
            }
        });
    }
    document.getElementById('shopNowBtn')?.addEventListener('click', () => {
        document.getElementById('categories').scrollIntoView({ behavior: 'smooth' });
    });
    document.addEventListener('click', (e) => {
        const cartModal = document.getElementById('cartModal');
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
            cartModal.classList.remove('active');
        }
        const loginModal = document.getElementById('loginModal');
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
        }
        const registerModal = document.getElementById('registerModal');
        if (e.target === registerModal) {
            registerModal.classList.remove('active');
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
                modal.classList.remove('active');
            });
        }
    });
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-purple-600', 'text-white');
                b.classList.add('text-gray-300');
            });
            e.target.classList.add('active', 'bg-purple-600', 'text-white');
            e.target.classList.remove('text-gray-300');
            filterProducts(e.target.dataset.category);
        });
    });
    document.getElementById('userBtn')?.addEventListener('click', handleLogout);
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    window.addEventListener('online', function () {
        showNotification('Koneksi tersambung kembali', 'success');
    });

    window.addEventListener('offline', function () {
        showNotification('Koneksi terputus', 'error');
    });
}
function closeCartModal() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'none';
        cartModal.classList.remove('active');
        console.log('Cart modal closed');
    }
}
function openCartModal() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'flex';
        cartModal.classList.add('active');
        displayCartItems();
        console.log('Cart modal opened');
    }
}
function showNotification(message, type) {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    const notification = document.createElement('div');
    notification.className = `notification fixed top-20 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-fade-in shadow-lg`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}
window.closeCartModal = closeCartModal;
window.openCartModal = openCartModal;