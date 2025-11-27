const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'carrito-gamer-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Secure en producción
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// Middleware para variables globales
app.use(async (req, res, next) => {
    res.locals.user = req.session.user || null;
    
    if (req.session.user) {
        try {
            const db = require('./config/database');
            const [countResult] = await db.promise().query(
                'SELECT SUM(cantidad) as total FROM carrito WHERE usuario_id = ?',
                [req.session.user.id]
            );
            res.locals.cartCount = countResult[0].total || 0;
        } catch (error) {
            console.log('Error al cargar carrito:', error.message);
            res.locals.cartCount = 0;
        }
    } else {
        res.locals.cartCount = 0;
    }
    
    next();
});

// Importar rutas con manejo de errores mejorado
const loadRoutes = () => {
    try {
        app.use('/', require('./routes/auth'));
        console.log('✅ Rutas de auth cargadas');
    } catch (error) {
        console.log('⚠️  Rutas de auth no disponibles:', error.message);
    }

    try {
        app.use('/products', require('./routes/products'));
        console.log('✅ Rutas de products cargadas');
    } catch (error) {
        console.log('⚠️  Rutas de products no disponibles:', error.message);
    }

    try {
        app.use('/cart', require('./routes/cart'));
        console.log('✅ Rutas de cart cargadas');
    } catch (error) {
        console.log('⚠️  Rutas de cart no disponibles:', error.message);
    }

    try {
        app.use('/orders', require('./routes/orders'));
        console.log('✅ Rutas de orders cargadas');
    } catch (error) {
        console.log('⚠️  Rutas de orders no disponibles:', error.message);
    }

    try {
        app.use('/admin', require('./routes/admin'));
        console.log('✅ Rutas de admin cargadas');
    } catch (error) {
        console.log('⚠️  Rutas de admin no disponibles:', error.message);
    }
};

loadRoutes();

// Ruta principal mejorada
app.get('/', async (req, res) => {
    try {
        const db = require('./config/database');
        const [products] = await db.promise().query('SELECT * FROM productos WHERE activo = true LIMIT 8');
        
        const featuredProducts = products.map(product => ({
            ...product,
            precio: Number(product.precio) || 0
        }));
        
        res.render('pages/index', { 
            featuredProducts: featuredProducts,
            user: req.session.user 
        });
    } catch (error) {
        console.log('Usando datos de prueba:', error.message);
        
        const featuredProducts = [
            {
                id: 1,
                nombre: 'Teclado Mecánico Razer BlackWidow V3',
                descripcion: 'Teclado mecánico gaming con switches Green clicky y iluminación RGB Chroma',
                precio: 1899.00,
                imagen: 'https://assets2.razerzone.com/images/pnx.assets/61e6b001a030d66e792cad0043aa30c5/razer-blackwidow-v3-pro-usp2-mobile.jpg',
                marca: 'Razer'
            },
            {
                id: 2,
                nombre: 'Mouse Logitech G Pro X Superlight',
                descripcion: 'Mouse gaming inalámbrico ultraligero 63g, sensor HERO 25K DPI',
                precio: 2499.00,
                imagen: 'https://i.makeagif.com/media/2-18-2024/pdXIms.gif',
                marca: 'Logitech'
            }
        ];
        
        res.render('pages/index', { 
            featuredProducts: featuredProducts,
            user: req.session.user 
        });
    }
});

// Ruta de salud mejorada
app.get('/health', async (req, res) => {
    const healthCheck = {
        status: 'OK',
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: PORT
    };

    // Verificar conexión a BD si existe
    try {
        const db = require('./config/database');
        await db.promise().query('SELECT 1');
        healthCheck.database = 'Connected';
    } catch (error) {
        healthCheck.database = 'Disconnected';
        healthCheck.dbError = error.message;
    }

    res.json(healthCheck);
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error global:', err);
    res.status(500).render('pages/error', {
        message: 'Algo salió mal',
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
});

// Ruta 404
app.use((req, res) => {
    res.status(404).render('pages/404', {
        title: 'Página No Encontrada',
        user: req.session.user
    });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en puerto: ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🎮 Carrito de compras gamer listo!`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});