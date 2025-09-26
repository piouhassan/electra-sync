"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const register = async (req, res) => {
    try {
        const { name, email, code, role } = req.body;
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'Un utilisateur avec cet email existe déjà'
            });
            return;
        }
        // Créer le nouvel utilisateur
        const user = await User_1.default.create({
            name,
            email,
            code,
            role
        });
        // Générer le token JWT
        const token = (0, jwt_1.generateToken)({
            id: user._id.toString(),
            email: user.email,
            role: user.role
        });
        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, code } = req.body;
        // Trouver l'utilisateur
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Email ou code incorrect'
            });
            return;
        }
        // Vérifier le mot de passe
        const isPasswordValid = await user.comparePassword(code);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Email ou code incorrect'
            });
            return;
        }
        // Générer le token JWT
        const token = (0, jwt_1.generateToken)({
            id: user._id.toString(),
            email: user.email,
            role: user.role
        });
        res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const user = await User_1.default.findById(userId).select('-code');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Profil récupéré avec succès',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt
                }
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
};
exports.getProfile = getProfile;
