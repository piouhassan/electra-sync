"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const audit_1 = require("../middleware/audit");
const router = (0, express_1.Router)();
// Routes publiques
router.post('/register', validation_1.validateRegistration, (0, audit_1.auditLogger)('USER_REGISTER'), authController_1.register);
router.post('/login', validation_1.validateLogin, (0, audit_1.auditLogger)('USER_LOGIN'), authController_1.login);
// Routes protégées
router.get('/profile', auth_1.requireAuth, (0, audit_1.auditLogger)('GET_PROFILE'), authController_1.getProfile);
exports.default = router;
