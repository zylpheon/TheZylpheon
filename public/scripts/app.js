document.addEventListener('DOMContentLoaded', function () {
    console.log('App initializing...');
    initializeApp();
});
function initializeApp() {
    try {
        checkAuthStatus();
        loadCategories();
        loadProducts();
        setupEventListeners();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification('Terjadi kesalahan saat memuat aplikasi', 'error');
    }
}
window.addEventListener('error', function (e) {
    console.error('Global error:', e.error);
    showNotification('Terjadi kesalahan aplikasi', 'error');
});
window.addEventListener('unhandledrejection', function (e) {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('Terjadi kesalahan jaringan', 'error');
});
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded');
    addGlobalLoadingStates();
});

function addGlobalLoadingStates() {
    const productsGrid = document.getElementById('productsGrid');
    const categoriesGrid = document.getElementById('categoriesGrid');

    if (productsGrid) {
        productsGrid.classList.add('loading-state');
    }

    if (categoriesGrid) {
        categoriesGrid.classList.add('loading-state');
    }
}
const AppUtils = {
    async refreshData() {
        try {
            await Promise.all([
                loadCategories(),
                loadProducts(),
                currentUser ? loadCart() : Promise.resolve()
            ]);
            showNotification('Data berhasil dimuat ulang', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            showNotification('Gagal memuat ulang data', 'error');
        }
    },
    resetApp() {
        currentUser = null;
        cart = [];
        products = [];
        categories = [];
        document.getElementById('loginBtn').classList.remove('hidden');
        document.getElementById('userBtn').classList.add('hidden');
        document.getElementById('cartCount').textContent = '0';
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        console.log('App state reset');
    }
};
window.AppUtils = AppUtils;