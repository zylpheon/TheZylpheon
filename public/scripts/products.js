async function loadCategories() {
    try {
        console.log('Loading categories...');
        const response = await fetch(`${API_BASE}/categories`);
        if (response.ok) {
            categories = await response.json();
            console.log('Categories loaded:', categories);
            displayCategories();
        } else {
            console.error('Failed to load categories:', response.status);
            displayCategoriesError();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        showNotification('Menggunakan data offline untuk kategori', 'warning');
        displayCategoriesError();
    }
}
function displayCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    if (categories.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center text-gray-400">
                <p>Tidak ada kategori tersedia</p>
            </div>
        `;
        return;
    }
    const allCategoryHtml = `
        <div class="bg-gray-700 rounded-lg p-6 text-center card-hover cursor-pointer" onclick="filterProducts('all')">
            <i class="fas fa-list text-3xl text-purple-400 mb-4"></i>
            <h4 class="font-semibold">Semua</h4>
        </div>
    `;
    const categoriesHtml = categories.map(category => `
        <div class="bg-gray-700 rounded-lg p-6 text-center card-hover cursor-pointer" onclick="filterProducts('${category.id}')">
            <i class="fas fa-tshirt text-3xl text-purple-400 mb-4"></i>
            <h4 class="font-semibold">${category.name}</h4>
        </div>
    `).join('');

    grid.innerHTML = allCategoryHtml + categoriesHtml;
}
function displayCategoriesError() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    grid.innerHTML = `
        <div class="col-span-full text-center">
            <div class="bg-gray-700 rounded-lg p-6">
                <i class="fas fa-wifi text-2xl text-yellow-400 mb-2"></i>
                <p class="text-gray-400">Data kategori tidak tersedia</p>
                <p class="text-sm text-gray-500 mb-3">Periksa koneksi internet Anda</p>
                <button onclick="loadCategories()" class="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                    <i class="fas fa-refresh mr-2"></i>Coba Lagi
                </button>
            </div>
        </div>
    `;
}
async function loadProducts() {
    try {
        console.log('Loading products...');
        const response = await fetch(`${API_BASE}/products`);
        if (response.ok) {
            products = await response.json();
            console.log('Products loaded:', products);
            displayProducts(products);
        } else {
            console.error('Failed to load products:', response.status);
            displayProductsError();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Menggunakan data offline untuk produk', 'warning');
        displayProductsError();
    }
}
function displayProducts(productsToShow) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    if (productsToShow.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center text-gray-400">
                <p>Tidak ada produk tersedia</p>
            </div>
        `;
        return;
    }
    grid.innerHTML = productsToShow.map(product => `
        <div class="bg-gray-800 rounded-lg overflow-hidden card-hover">
            <div class="h-64 bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                <i class="fas fa-tshirt text-6xl text-white opacity-50"></i>
            </div>
            <div class="p-6">
                <h4 class="font-semibold text-lg mb-2">${product.name}</h4>
                <p class="text-gray-400 text-sm mb-3">${product.description || 'Produk berkualitas tinggi'}</p>
                <div class="flex justify-between items-center mb-4">
                    <span class="text-xl font-bold gradient-text">Rp ${product.price ? product.price.toLocaleString('id-ID') : '0'}</span>
                    <span class="text-sm text-gray-400">Size: ${product.size || 'M'}</span>
                </div>
                <div class="flex space-x-2">
                    <button onclick="addToCart(${product.id})" class="flex-1 gradient-bg py-2 rounded-lg hover:opacity-90 transition-opacity">
                        <i class="fas fa-cart-plus mr-2"></i>Tambah
                    </button>
                    <button onclick="viewProduct(${product.id})" class="px-4 py-2 border border-purple-500 text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-colors">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}
function displayProductsError() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = `
        <div class="col-span-full text-center">
            <div class="bg-gray-800 rounded-lg p-6">
                <i class="fas fa-wifi text-2xl text-yellow-400 mb-2"></i>
                <p class="text-gray-400">Data produk tidak tersedia</p>
                <p class="text-sm text-gray-500 mb-3">Periksa koneksi internet Anda</p>
                <button onclick="loadProducts()" class="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                    <i class="fas fa-refresh mr-2"></i>Coba Lagi
                </button>
            </div>
        </div>
    `;
}
function filterProducts(categoryId) {
    if (categoryId === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(p => p.category_id == categoryId);
        displayProducts(filtered);
    }
}
function viewProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const details = `Detail Produk:
Nama: ${product.name}
Harga: Rp ${(product.price || 0).toLocaleString('id-ID')}
Deskripsi: ${product.description || 'Tidak ada deskripsi'}
Stok: ${product.stock || 'Tersedia'}
Size: ${product.size || 'M'}
Warna: ${product.color || 'Beragam'}`;
        alert(details);
    }
}