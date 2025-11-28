const mysql = require('mysql2');
require('dotenv').config();

// Configuración de conexión a MySQL
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '724058',
    database: process.env.DB_NAME || 'carrito_gamer',
    port: process.env.DB_PORT || 3306,
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Conectar a la base de datos
connection.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err.message);
        console.log('🔧 Configuración usada:');
        console.log('   Host:', process.env.DB_HOST || 'localhost');
        console.log('   DB:', process.env.DB_NAME || 'carrito_gamer');
        console.log('   User:', process.env.DB_USER || 'root');
        console.log('   Port:', process.env.DB_PORT || 3306);
        console.log('   Environment:', process.env.NODE_ENV || 'development');
    } else {
        console.log('✅ Conectado a MySQL - DATORADOR');
        console.log('📊 Base de datos:', process.env.DB_NAME || 'carrito_gamer');
    }
});

// Manejar errores de conexión
connection.on('error', (err) => {
    console.error('💥 Error de MySQL:', err.message);
    
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('🔁 Reconectando a la base de datos...');
        connection.connect();
    }
});

module.exports = connection;