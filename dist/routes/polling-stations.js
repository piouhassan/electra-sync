"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PollingStation_1 = __importDefault(require("../models/PollingStation"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /polling-stations - Récupérer tous les bureaux de vote
router.get('/', async (req, res) => {
    try {
        const stations = await PollingStation_1.default.find().sort({ name: 1 });
        res.json({
            success: true,
            data: stations
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des bureaux de vote'
        });
    }
});
// GET /polling-stations/:id - Récupérer un bureau de vote par ID
router.get('/:id', async (req, res) => {
    try {
        const station = await PollingStation_1.default.findById(req.params.id);
        if (!station) {
            return res.status(404).json({
                success: false,
                message: 'Bureau de vote non trouvé'
            });
        }
        res.json({
            success: true,
            data: station
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du bureau de vote'
        });
    }
});
// GET /polling-stations/:id/candidates - Récupérer les candidats d'un bureau de vote
router.get('/:id/candidates', async (req, res) => {
    try {
        const station = await PollingStation_1.default.findById(req.params.id)
            .populate({
            path: 'candidates',
            populate: {
                path: 'election',
                select: 'title description status'
            }
        });
        if (!station) {
            return res.status(404).json({
                success: false,
                message: 'Bureau de vote non trouvé'
            });
        }
        res.json({
            success: true,
            data: station || []
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des candidats du bureau de vote'
        });
    }
});
// GET /polling-stations/:id/votes - Récupérer les votes d'un bureau de vote
router.get('/:id/votes', auth_1.requireAuth, async (req, res) => {
    try {
        const station = await PollingStation_1.default.findById(req.params.id)
            .populate({
            path: 'votes',
            populate: [
                { path: 'user', select: 'name email' },
                { path: 'election', select: 'title' },
                { path: 'candidate', select: 'name' }
            ]
        });
        if (!station) {
            return res.status(404).json({
                success: false,
                message: 'Bureau de vote non trouvé'
            });
        }
        res.json({
            success: true,
            data: station || []
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des votes du bureau de vote'
        });
    }
});
// POST /polling-stations - Créer un nouveau bureau de vote
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { name, location } = req.body;
        // Vérifier si un bureau avec le même nom existe déjà
        const existingStation = await PollingStation_1.default.findOne({ name });
        if (existingStation) {
            return res.status(400).json({
                success: false,
                message: 'Un bureau de vote avec ce nom existe déjà'
            });
        }
        const station = new PollingStation_1.default({
            name,
            location
        });
        await station.save();
        res.status(201).json({
            success: true,
            data: station,
            message: 'Bureau de vote créé avec succès'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du bureau de vote'
        });
    }
});
// PUT /polling-stations/:id - Mettre à jour un bureau de vote
router.put('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const { name, location } = req.body;
        // Vérifier si un autre bureau avec le même nom existe déjà
        const existingStation = await PollingStation_1.default.findOne({
            name,
            _id: { $ne: req.params.id }
        });
        if (existingStation) {
            return res.status(400).json({
                success: false,
                message: 'Un bureau de vote avec ce nom existe déjà'
            });
        }
        const station = await PollingStation_1.default.findByIdAndUpdate(req.params.id, { name, location }, { new: true, runValidators: true });
        if (!station) {
            return res.status(404).json({
                success: false,
                message: 'Bureau de vote non trouvé'
            });
        }
        res.json({
            success: true,
            data: station,
            message: 'Bureau de vote mis à jour avec succès'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du bureau de vote'
        });
    }
});
// DELETE /polling-stations/:id - Supprimer un bureau de vote
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const station = await PollingStation_1.default.findById(req.params.id);
        if (!station) {
            return res.status(404).json({
                success: false,
                message: 'Bureau de vote non trouvé'
            });
        }
        // Vérifier s'il y a des votes ou candidats liés à ce bureau
        const stationWithRefs = await PollingStation_1.default.findById(req.params.id)
            .populate('candidates')
            .populate('votes');
        // if ((stationWithRefs?.candidates && stationWithRefs.candidates.length > 0) ||
        //     (stationWithRefs?.votes && stationWithRefs.votes.length > 0)) {
        //   return res.status(400).json({
        //     success: false,
        //     message: 'Impossible de supprimer ce bureau de vote car il contient des candidats ou des votes'
        //   } as ApiResponse);
        // }
        await PollingStation_1.default.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Bureau de vote supprimé avec succès'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du bureau de vote'
        });
    }
});
exports.default = router;
