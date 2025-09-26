"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Election_1 = __importDefault(require("../models/Election"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /elections - Récupérer toutes les élections
router.get('/', async (req, res) => {
    try {
        const elections = await Election_1.default.find()
            .populate('candidates')
            .populate('votes')
            .populate('results');
        res.json({
            success: true,
            data: elections
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des élections'
        });
    }
});
// GET /elections/:id - Récupérer une élection par ID
router.get('/:id', async (req, res) => {
    try {
        const election = await Election_1.default.findById(req.params.id)
            .populate('candidates')
            .populate('votes')
            .populate('results');
        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Élection non trouvée'
            });
        }
        res.json({
            success: true,
            data: election
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'élection'
        });
    }
});
// POST /elections - Créer une nouvelle élection
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { title, description, start_date, end_date, status } = req.body;
        const election = new Election_1.default({
            title,
            description,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            status: status || 'upcoming'
        });
        await election.save();
        res.status(201).json({
            success: true,
            data: election,
            message: 'Élection créée avec succès'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de l\'élection'
        });
    }
});
// PUT /elections/:id - Mettre à jour une élection
router.put('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const { title, description, start_date, end_date, status } = req.body;
        const election = await Election_1.default.findByIdAndUpdate(req.params.id, {
            title,
            description,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            status
        }, { new: true, runValidators: true });
        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Élection non trouvée'
            });
        }
        res.json({
            success: true,
            data: election,
            message: 'Élection mise à jour avec succès'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'élection'
        });
    }
});
// DELETE /elections/:id - Supprimer une élection
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const election = await Election_1.default.findByIdAndDelete(req.params.id);
        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Élection non trouvée'
            });
        }
        res.json({
            success: true,
            message: 'Élection supprimée avec succès'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'élection'
        });
    }
});
exports.default = router;
