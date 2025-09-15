async function addToCart(productId) {
    if (!currentUser) {
        document.getElementById('loginModal').classList.add('active');
        showNotification('Silakan login terlebih dahulu', 'error');
        return;
    }
    try {
        const response = await fetch(`${API_BASE}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: 1,
                size: 'M'
            })
        });
        if (response.ok) {
            showNotification('Produk ditambahkan ke keranjang!', 'success');
            loadCart();
        } else {
            const data = await response.json();
            showNotification(data.message || 'Gagal menambahkan ke keranjang', 'error');
        }
    } catch (error) {
        console.error('Add to cart error:', error);
        showNotification('Terjadi kesalahan', 'error');
    }
}
async function loadCart() {
    if (!currentUser) return;
    try {
        const response = await fetch(`${API_BASE}/cart`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (response.ok) {
            cart = await response.json();
            updateCartCount();
        } else {
            console.error('Failed to load cart');
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}
function updateCartCount() {
    document.getElementById('cartCount').textContent = cart.length;
}
function displayCartItems() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    if (!cartItems) return;
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-center text-gray-400 py-8">Keranjang kosong</p>';
        cartTotal.textContent = 'Rp 0';
        return;
    }
    let total = 0;
    cartItems.innerHTML = cart.map(item => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        total += itemTotal;
        return `
            <div class="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
                <div class="flex-1">
                    <h5 class="font-semibold">${item.name || 'Produk'}</h5>
                    <p class="text-sm text-gray-400">Size: ${item.size || 'M'} | Qty: ${item.quantity || 1}</p>
                    <p class="text-purple-400">Rp ${(item.price || 0).toLocaleString('id-ID')}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="font-semibold">Rp ${itemTotal.toLocaleString('id-ID')}</span>
                    <button onclick="removeFromCart(${item.id})" class="text-red-400 hover:text-red-300 ml-2">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    if (cartTotal) {
        cartTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }
}
async function removeFromCart(cartItemId) {
    try {
        const response = await fetch(`${API_BASE}/cart/${cartItemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (response.ok) {
            showNotification('Item dihapus dari keranjang', 'success');
            loadCart();
            displayCartItems();
        } else {
            showNotification('Gagal menghapus item', 'error');
        }
    } catch (error) {
        console.error('Remove from cart error:', error);
        showNotification('Gagal menghapus item', 'error');
    }
}