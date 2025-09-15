// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'toko_baju'
};

let db;

async function initDatabase() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL database');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

// Middleware untuk verifikasi token
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

// Routes

// GET all products
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
});

// GET product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error });
    }
});

// GET categories
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM categories');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
});

// POST register user
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, full_name, phone, address } = req.body;

        // Hash password
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

// POST login
app.post('/api/login', async (req, res) => {
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

// GET cart items
app.get('/api/cart', verifyToken, async (req, res) => {
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

// POST add to cart
app.post('/api/cart', verifyToken, async (req, res) => {
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

// DELETE cart item
app.delete('/api/cart/:id', verifyToken, async (req, res) => {
    try {
        await db.execute('DELETE FROM cart WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.userId]);
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing from cart', error });
    }
});

// Serve HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize database and start server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});