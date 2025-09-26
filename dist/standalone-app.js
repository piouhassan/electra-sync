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

// Créer l'application Express
const app = (0, express_1.default)();

// Middlewares de sécurité
app.use((0, helmet_1.default)());

// Configuration CORS
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true
}));

// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limite à 100 requêtes par IP par fenêtre
});
app.use(limiter);

// Middlewares de parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));

// Logger
app.use((0, morgan_1.default)('combined'));

// Mock data
const mockUsers = [
    { id: 1, name: 'Admin', email: 'admin@electra.com', role: 'admin' },
    { id: 2, name: 'Bureau 1', email: 'bureau1@electra.com', role: 'bureau' }
];

const mockElections = [
    { id: 1, name: 'Élection Présidentielle 2024', status: 'active', date: '2024-03-15' }
];

const mockCandidates = [
    { id: 1, name: 'Candidat A', party: 'Parti Alpha', electionId: 1 },
    { id: 2, name: 'Candidat B', party: 'Parti Beta', electionId: 1 }
];

// Routes API
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Electra Sync Pro API - Standalone Mode',
        version: '1.0.0'
    });
});

app.get('/api/users', (req, res) => {
    res.json({
        success: true,
        data: mockUsers
    });
});

app.get('/api/elections', (req, res) => {
    res.json({
        success: true,
        data: mockElections
    });
});

app.get('/api/candidates', (req, res) => {
    res.json({
        success: true,
        data: mockCandidates
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    // Mock authentication
    const user = mockUsers.find(u => u.email === email);
    if (user && password) {
        res.json({
            success: true,
            data: {
                user,
                token: 'mock-jwt-token'
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }
});

// Route de base
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Electra Sync Pro API - Standalone Mode',
        version: '1.0.0'
    });
});

// Middleware 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});

// Gestionnaire d'erreur global
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erreur interne du serveur',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Fonction pour démarrer le serveur
const startServer = async () => {
    try {
        console.log('🔧 Mode standalone - sans base de données');

        // Démarrer le serveur
        const PORT = process.env.PORT || 5002;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Serveur démarré sur le port ${PORT}`);
            console.log(`📊 Environnement: standalone`);
            console.log(`🌐 API disponible sur: http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Erreur lors du démarrage du serveur:', error);
        process.exit(1);
    }
};

// Démarrer le serveur
startServer();