"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = void 0;
const Audit_1 = __importDefault(require("../models/Audit"));
const auditLogger = (action) => {
    return async (req, res, next) => {
        try {
            // Créer l'entrée d'audit
            await Audit_1.default.create({
                userId: req.user?.id,
                action,
                actionDate: new Date(),
                details: JSON.stringify({
                    method: req.method,
                    path: req.path,
                    body: req.body,
                    query: req.query
                }),
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
            next();
        }
        catch (error) {
            console.error('Erreur lors de l\'audit:', error);
            next(); // Continue même si l'audit échoue
        }
    };
};
exports.auditLogger = auditLogger;
