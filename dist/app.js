"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const routes_1 = __importDefault(require("./routes"));

// Charger les variables d'environnement
dotenv_1.default.config();

// Créer l'application Express
const app = (0, express_1.default)();

// Middlewares de sécurité
app.use((0, helmet_1.default)());

// Configuration CORS
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// Middlewares de parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('combined'));
}

// 🔥 INITIALISATION MONGODB AU DÉMARRAGE
let dbInitialized = false;

const initializeDB = async () => {
    if (!dbInitialized) {
        try {
            await (0, database_1.default)();
            dbInitialized = true;
            console.log('🔌 MongoDB initialisé avec succès');
        } catch (error) {
            console.error('⚠️ Erreur initialisation MongoDB:', error.message);
            // L'API continue de fonctionner même sans DB
        }
    }
};

// Initialiser la DB immédiatement
initializeDB();

// Middleware léger pour vérifier la connexion (optionnel)
app.use(async (req, res, next) => {
    // Réessayer la connexion si elle n'est pas établie
    if (!dbInitialized) {
        await initializeDB();
    }
    next();
});

// Routes principales
app.use('/api', routes_1.default);

// Route de base
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Electra Sync Pro API',
        version: '1.0.0',
        database: dbInitialized ? 'connected' : 'disconnected'
    });
});

// Route pour obtenir l'IP du serveur Vercel
app.get('/ip', async (req, res) => {
    try {
        const https = require('https');

        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        const forwardedFor = req.headers['x-forwarded-for'];
        const vercelIP = req.headers['x-vercel-forwarded-for'];

        const getPublicIP = () => {
            return new Promise((resolve) => {
                https.get('https://api.ipify.org?format=json', (resp) => {
                    let data = '';
                    resp.on('data', (chunk) => { data += chunk; });
                    resp.on('end', () => {
                        try {
                            const parsed = JSON.parse(data);
                            resolve(parsed.ip);
                        } catch (e) {
                            resolve('Unknown');
                        }
                    });
                }).on('error', () => resolve('Error'));
            });
        };

        const publicIP = await getPublicIP();

        res.json({
            success: true,
            ips: {
                clientIP,
                forwardedFor,
                vercelIP,
                publicIP,
                headers: req.headers
            }
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

// Route de test MongoDB
app.get('/test-mongo', async (req, res) => {
    const mongoose_1 = require("mongoose");
    try {
        const mongoURI = process.env.MONGODB_URI || "mongodb+srv://godwinkodjo18_db_user:godwin1234@cluster0.eb7vkwv.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

        const startTime = Date.now();
        await mongoose_1.default.connect(mongoURI, {
            serverSelectionTimeoutMS: 3000,
            connectTimeoutMS: 3000
        });
        const endTime = Date.now();

        res.json({
            success: true,
            message: `MongoDB connecté en ${endTime - startTime}ms`,
            connectionState: mongoose_1.default.connection.readyState
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message,
            code: error.code || 'NO_CODE'
        });
    }
});

// Middleware 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
    console.error('Erreur:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erreur interne du serveur',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Fonction pour démarrer le serveur en local
const startServer = async () => {
    try {
        // Initialiser MongoDB
        await initializeDB();

        const PORT = process.env.PORT || 5000;
        const HOST = process.env.RENDER ? '0.0.0.0' : 'localhost';

        app.listen(PORT, HOST, () => {
            console.log(`🚀 Serveur démarré sur ${HOST}:${PORT}`);
            console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 API disponible sur: http://${HOST}:${PORT}`);
            console.log(`🔌 MongoDB: ${dbInitialized ? 'connecté' : 'déconnecté'}`);
        });
    }
    catch (error) {
        console.error('❌ Erreur lors du démarrage du serveur:', error);
        process.exit(1);
    }
};

// En local et Render : on lance app.listen
// Sur Vercel : on exporte seulement app
if (require.main === module || process.env.RENDER) {
    startServer();
}

// Export pour Vercel
module.exports = app;