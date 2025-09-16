const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'toko_baju'
};
let db;
let isDbConnected = false;
async function initDatabase() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL database');
        isDbConnected = true;
    } catch (error) {
        console.error('Database connection failed:', error);
        console.log('Will use JSON files as fallback');
        isDbConnected = false;
    }
}
async function loadJsonData(filename) {
    try {
        const data = await fs.readFile(path.join(__dirname, 'public', 'temporary-data', filename), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        return [];
    }
}
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};
app.get('/api/products', async (req, res) => {
    try {
        if (isDbConnected) {
            const [rows] = await db.execute(`
                SELECT p.*, c.name as category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id
            `);
            res.json(rows);
        } else {
            const products = await loadJsonData('products.json');
            const categories = await loadJsonData('categories.json');
            const productsWithCategories = products.map(product => {
                const category = categories.find(cat => cat.id === product.category_id);
                return {
                    ...product,
                    category_name: category ? category.name : null
                };
            });
            res.json(productsWithCategories);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        try {
            const products = await loadJsonData('products.json');
            res.json(products);
        } catch (fallbackError) {
            res.status(500).json({ message: 'Error fetching products', error });
        }
    }
});
app.get('/api/products/:id', async (req, res) => {
    try {
        if (isDbConnected) {
            const [rows] = await db.execute(`
                SELECT p.*, c.name as category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.id = ?
            `, [req.params.id]);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(rows[0]);
        } else {
            const products = await loadJsonData('products.json');
            const categories = await loadJsonData('categories.json');
            const product = products.find(p => p.id == req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            const category = categories.find(cat => cat.id === product.category_id);
            const productWithCategory = {
                ...product,
                category_name: category ? category.name : null
            };
            res.json(productWithCategory);
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Error fetching product', error });
    }
});
app.get('/api/categories', async (req, res) => {
    try {
        if (isDbConnected) {
            const [rows] = await db.execute('SELECT * FROM categories');
            res.json(rows);
        } else {
            const categories = await loadJsonData('categories.json');
            res.json(categories);
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        try {
            const categories = await loadJsonData('categories.json');
            res.json(categories);
        } catch (fallbackError) {
            res.status(500).json({ message: 'Error fetching categories', error });
        }
    }
});
app.post('/api/register', async (req, res) => {
    if (!isDbConnected) {
        return res.status(503).json({ message: 'Registration not available - database offline' });
    }
    try {
        const { username, email, password, full_name, phone, address } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password, full_name, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, hashedPassword, full_name, phone, address]
        );
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ message: 'Username or email already exists' });
        } else {
            res.status(500).json({ message: 'Registration failed', error });
        }
    }
});
app.post('/api/login', async (req, res) => {
    if (!isDbConnected) {
        return res.status(503).json({ message: 'Login not available - database offline' });
    }
    try {
        const { email, password } = req.body;
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'secret-key',
            { expiresIn: '24h' }
        );
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error });
    }
});
app.get('/api/cart', verifyToken, async (req, res) => {
    if (!isDbConnected) {
        return res.status(503).json({ message: 'Cart not available - database offline' });
    }
    try {
        const [rows] = await db.execute(`
            SELECT c.*, p.name, p.price, p.image_url 
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ?
        `, [req.user.userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error });
    }
});
app.post('/api/cart', verifyToken, async (req, res) => {
    if (!isDbConnected) {
        return res.status(503).json({ message: 'Cart not available - database offline' });
    }
    try {
        const { product_id, quantity, size } = req.body;
        const [result] = await db.execute(
            'INSERT INTO cart (user_id, product_id, quantity, size) VALUES (?, ?, ?, ?)',
            [req.user.userId, product_id, quantity, size]
        );
        res.status(201).json({ message: 'Product added to cart', cartId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error adding to cart', error });
    }
});
app.delete('/api/cart/:id', verifyToken, async (req, res) => {
    if (!isDbConnected) {
        return res.status(503).json({ message: 'Cart not available - database offline' });
    }
    try {
        await db.execute('DELETE FROM cart WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.userId]);
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing from cart', error });
    }
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Database status: ${isDbConnected ? 'Connected' : 'Offline (using JSON fallback)'}`);
    });
});