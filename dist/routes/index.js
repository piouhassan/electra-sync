"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const users_1 = __importDefault(require("./users"));
const elections_1 = __importDefault(require("./elections"));
const candidates_1 = __importDefault(require("./candidates"));
const votes_1 = __importDefault(require("./votes"));
const polling_stations_1 = __importDefault(require("./polling-stations"));
const results_1 = __importDefault(require("./results"));
const router = (0, express_1.Router)();
// Monter les routes
router.use('/auth', auth_1.default);
router.use('/users', users_1.default);
router.use('/elections', elections_1.default);
router.use('/candidates', candidates_1.default);
router.use('/votes', votes_1.default);
router.use('/polling-stations', polling_stations_1.default);
router.use('/results', results_1.default);
// Route de santé
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API en fonctionnement',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
