"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("../middleware/auth");
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
// GET /users - Récupérer tous les utilisateurs (admin uniquement)
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé. Admin requis.'
            });
        }
        const users = await User_1.default.find()
            .select('-password')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: users
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs'
        });
    }
});
// GET /users/:id - Récupérer un utilisateur par ID
router.get('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const requestingUser = req.user;
        // Les utilisateurs ne peuvent voir que leur propre profil, sauf les admins
        if (requestingUser.role !== 'admin' && requestingUser.id !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
        }
        const user = await User_1.default.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'utilisateur'
        });
    }
});
// GET /users/:id/votes - Récupérer les votes d'un utilisateur
router.get('/:id/votes', auth_1.requireAuth, async (req, res) => {
    try {
        const requestingUser = req.user;
        // Les utilisateurs ne peuvent voir que leurs propres votes, sauf les admins
        if (requestingUser.role !== 'admin' && requestingUser.id !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
        }
        const user = await User_1.default.findById(req.params.id)
            .populate({
            path: 'votes',
            populate: [
                { path: 'election', select: 'title description' },
                { path: 'candidate', select: 'name' },
                { path: 'polling_station', select: 'name location' }
            ]
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        res.json({
            success: true,
            data: user || []
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des votes de l\'utilisateur'
        });
    }
});
// POST /users - Créer un nouvel utilisateur (admin uniquement)
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé. Admin requis.'
            });
        }
        const { name, email, code, role, password } = req.body;
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User_1.default.findOne({
            $or: [{ email }, { code }]
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Un utilisateur avec cet email ou code existe déjà'
            });
        }
        // Hasher le mot de passe
        const hashedPassword = await bcryptjs_1.default.hash(password || 'password123', 12);
        const user = new User_1.default({
            name,
            email,
            code,
            role: role || 'voter',
            password: hashedPassword
        });
        await user.save();
        // Retourner l'utilisateur sans le mot de passe
        const userResponse = user.toObject();
        // delete userResponse?.code;
        res.status(201).json({
            success: true,
            data: userResponse,
            message: 'Utilisateur créé avec succès'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'utilisateur'
        });
    }
});
// PUT /users/:id - Mettre à jour un utilisateur
router.put('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const requestingUser = req.user;
        const { name, email, code, role, password } = req.body;
        // Les utilisateurs peuvent modifier leur propre profil, les admins peuvent modifier tous les profils
        if (requestingUser.role !== 'admin' && requestingUser.id !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé'
            });
        }
        // Seuls les admins peuvent modifier le rôle
        const updateData = { name, email, code };
        if (requestingUser.role === 'admin' && role !== undefined) {
            updateData.role = role;
        }
        // Si un nouveau mot de passe est fourni
        if (password) {
            updateData.password = await bcryptjs_1.default.hash(password, 12);
        }
        // Vérifier l'unicité de l'email et du code
        const existingUser = await User_1.default.findOne({
            $or: [{ email }, { code }],
            _id: { $ne: req.params.id }
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Un utilisateur avec cet email ou code existe déjà'
            });
        }
        const user = await User_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        res.json({
            success: true,
            data: user,
            message: 'Utilisateur mis à jour avec succès'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'utilisateur'
        });
    }
});
// DELETE /users/:id - Supprimer un utilisateur (admin uniquement)
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé. Admin requis.'
            });
        }
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        // Vérifier s'il y a des votes liés à cet utilisateur
        const userWithVotes = await User_1.default.findById(req.params.id).populate('votes');
        // if (userWithVotes?.votes && userWithVotes.votes.length > 0) {
        //   return res.status(400).json({
        //     success: false,
        //     message: 'Impossible de supprimer cet utilisateur car il a des votes enregistrés'
        //   } as ApiResponse);
        // }
        await User_1.default.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Utilisateur supprimé avec succès'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'utilisateur'
        });
    }
});
// GET /users/role/:role - Récupérer les utilisateurs par rôle (admin uniquement)
router.get('/role/:role', auth_1.requireAuth, async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé. Admin requis.'
            });
        }
        const users = await User_1.default.find({ role: req.params.role })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: users
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs'
        });
    }
});
exports.default = router;
