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

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'carrito-gamer-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Middleware global para user y cart count
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

// Rutas con manejo de errores
const routes = [
    { path: '/', route: './routes/auth' },
    { path: '/products', route: './routes/products' },
    { path: '/cart', route: './routes/cart' },
    { path: '/orders', route: './routes/orders' },
    { path: '/admin', route: './routes/admin' }
];

routes.forEach(({ path, route }) => {
    try {
        app.use(path, require(route));
        console.log(`✅ Ruta cargada: ${path}`);
    } catch (error) {
        console.log(`⚠️  Ruta no disponible: ${path} - ${error.message}`);
    }
});

// Ruta principal
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
        console.error('Error al cargar productos, usando datos de prueba:', error);
        
        const featuredProducts = [
            {
                id: 1,
                nombre: 'Teclado Mecánico Razer BlackWidow V3',
                descripcion: 'Teclado mecánico gaming con switches Green clicky y iluminación RGB Chroma',
                precio: 1899.00,
                imagen: '/images/teclado-razer.jpg',
                marca: 'Razer'
            },
            {
                id: 2,
                nombre: 'Mouse Logitech G Pro X Superlight',
                descripcion: 'Mouse gaming inalámbrico ultraligero 63g, sensor HERO 25K DPI',
                precio: 2499.00,
                imagen: '/images/mouse-logitech.jpg',
                marca: 'Logitech'
            }
        ];
        
        res.render('pages/index', { 
            featuredProducts: featuredProducts,
            user: req.session.user 
        });
    }
});

// Health check para Render
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor DATORADOR funcionando',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).render('pages/errors', { 
        error: 'Página no encontrada',
        message: 'La página que buscas no existe.'
    });
});

// Manejo de errores del servidor
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err);
    res.status(500).render('pages/errors', { 
        error: 'Error interno del servidor',
        message: 'Algo salió mal. Por favor, intenta más tarde.'
    });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor DATORADOR corriendo en puerto ${PORT}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});