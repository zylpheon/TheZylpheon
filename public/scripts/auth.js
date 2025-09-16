function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
        try {
            currentUser = JSON.parse(user);
            updateUIForLoggedInUser();
            loadCart();
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
}
function updateUIForLoggedInUser() {
    document.getElementById('loginBtn').classList.add('hidden');
    document.getElementById('userBtn').classList.remove('hidden');
    document.getElementById('userName').textContent = currentUser.username;
}
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            updateUIForLoggedInUser();
            document.getElementById('loginModal').classList.remove('active');
            showNotification('Login berhasil!', 'success');
            loadCart();
        } else {
            showNotification(data.message || 'Login gagal', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        if (error.message.includes('fetch')) {
            showNotification('Tidak dapat terhubung ke server. Fitur login tidak tersedia.', 'error');
        } else {
            showNotification('Terjadi kesalahan saat login', 'error');
        }
    }
}
async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const full_name = document.getElementById('registerFullName').value;
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, full_name })
        });
        const data = await response.json();
        if (response.ok) {
            showNotification('Registrasi berhasil! Silakan login.', 'success');
            document.getElementById('registerModal').classList.remove('active');
            document.getElementById('loginModal').classList.add('active');
            document.getElementById('registerForm').reset();
        } else {
            if (response.status === 503) {
                showNotification('Registrasi tidak tersedia - server offline', 'error');
            } else {
                showNotification(data.message || 'Registrasi gagal', 'error');
            }
        }
    } catch (error) {
        console.error('Register error:', error);
        if (error.message.includes('fetch')) {
            showNotification('Tidak dapat terhubung ke server. Fitur registrasi tidak tersedia.', 'error');
        } else {
            showNotification('Terjadi kesalahan saat registrasi', 'error');
        }
    }
}
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    cart = [];
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('userBtn').classList.add('hidden');
    document.getElementById('cartCount').textContent = '0';
    showNotification('Logout berhasil!', 'success');
}