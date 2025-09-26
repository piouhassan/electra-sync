"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateRegistration = void 0;
const joi_1 = __importDefault(require("joi"));
const types_1 = require("../types");
const validateRegistration = (req, res, next) => {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required().min(2).max(50).messages({
            'string.empty': 'Le nom est requis',
            'string.min': 'Le nom doit contenir au moins 2 caractères',
            'string.max': 'Le nom ne peut pas dépasser 50 caractères'
        }),
        email: joi_1.default.string().email().required().messages({
            'string.email': 'Email invalide',
            'string.empty': 'L\'email est requis'
        }),
        code: joi_1.default.string().required().min(4).messages({
            'string.empty': 'Le code est requis',
            'string.min': 'Le code doit contenir au moins 4 caractères'
        }),
        role: joi_1.default.string().valid(...Object.values(types_1.Role)).required().messages({
            'any.only': 'Rôle invalide',
            'string.empty': 'Le rôle est requis'
        })
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Données de validation invalides',
            error: error.details[0].message
        });
    }
    next();
};
exports.validateRegistration = validateRegistration;
const validateLogin = (req, res, next) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            'string.email': 'Email invalide',
            'string.empty': 'L\'email est requis'
        }),
        code: joi_1.default.string().required().messages({
            'string.empty': 'Le code est requis'
        })
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Données de validation invalides',
            error: error.details[0].message
        });
    }
    next();
};
exports.validateLogin = validateLogin;
