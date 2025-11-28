const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'defaultdb',
    port: process.env.DB_PORT || 14502,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err.message);
        console.log('🔧 Configuración usada:');
        console.log('   Host:', process.env.DB_HOST);
        console.log('   DB:', process.env.DB_NAME || 'defaultdb');
        console.log('   User:', process.env.DB_USER);
    } else {
        console.log('✅ Conectado a MySQL - DATORADOR');
        console.log('📊 Base de datos:', process.env.DB_NAME || 'defaultdb');
    }
});

connection.on('error', (err) => {
    console.error('💥 Error de MySQL:', err.message);
});

module.exports = connection;