const mysql = require('mysql2');
require('dotenv').config();

// Configuración para Railway - USANDO CONEXIÓN EXTERNA
const dbConfig = {
    host: process.env.MYSQLHOST || 'caboose.proxy.rlwy.net',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || 'bpiEFRXVmOjukd1UsytidctbXFHHJmLJ',
    database: 'carrito_gamer',  // ← FORZAR tu BD aquí
    port: process.env.MYSQLPORT || 57659,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    reconnect: true
};

// Connection pool para producción
const connection = mysql.createPool(dbConfig);

// Verificar conexión mejorada
connection.getConnection((err, conn) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err.message);
        console.log('🔧 Configuración usada:', {
            host: dbConfig.host,
            port: dbConfig.port,
            database: dbConfig.database,
            user: dbConfig.user
        });
        return;
    }
    
    console.log('✅ Conectado a la base de datos MySQL en Railway');
    console.log('📊 Base de datos:', dbConfig.database);
    
    // Verificar que la BD tenga tablas
    conn.query('SHOW TABLES', (error, results) => {
        if (error) {
            console.log('⚠️  No se pudieron verificar las tablas:', error.message);
        } else {
            console.log(`📋 Tablas encontradas: ${results.length}`);
            if (results.length > 0) {
                console.log('✅ Base de datos con estructura lista');
            } else {
                console.log('⚠️  La base de datos está vacía');
            }
        }
        conn.release();
    });
});

// Manejar errores de conexión
connection.on('error', (err) => {
    console.error('❌ Error de conexión MySQL:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('🔧 Reconectando...');
    }
});

module.exports = connection;