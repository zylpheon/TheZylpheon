const mysql = require('mysql2/promise');
require('dotenv').config();
async function testConnection() {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'toko_baju'
    };
    console.log('Testing connection with config:', {
        ...dbConfig,
        password: dbConfig.password ? '***' : '(empty)'
    });
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connection successful!');
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Test query successful:', rows);
        await connection.end();
        console.log('✅ Connection closed properly');
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Suggestions:');
            console.log('1. Make sure MySQL server is running');
            console.log('2. Check if MySQL is running on the correct port (default: 3306)');
            console.log('3. Verify your credentials (username/password)');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('\n💡 Database does not exist. Create it first:');
            console.log('CREATE DATABASE toko_baju;');
        }
    }
}
testConnection();