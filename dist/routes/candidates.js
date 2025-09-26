"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Candidate_1 = __importDefault(require("../models/Candidate"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /candidates - Récupérer tous les candidats
router.get('/', async (req, res) => {
    try {
        const candidates = await Candidate_1.default.find();
        res.json({
            success: true,
            data: candidates
        });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des candidats'
        });
    }
});
// GET /candidates/:id - Récupérer un candidat par ID
router.get('/:id', async (req, res) => {
    try {
        const candidate = await Candidate_1.default.findById(req.params.id);
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidat non trouvé'
            });
        }
        res.json({
            success: true,
            data: candidate
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du candidat'
        });
    }
});
// GET /candidates/election/:electionId - Récupérer les candidats d'une élection
router.get('/election/:electionId', async (req, res) => {
    try {
        const candidates = await Candidate_1.default.find({ election: req.params.electionId })
        res.json({
            success: true,
            data: candidates
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des candidats'
        });
    }
});
// POST /candidates - Créer un nouveau candidat
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { name, party } = req.body;
        const candidate = new Candidate_1.default({
            name,
            party: party,
        });
        await candidate.save();

        res.status(201).json({
            success: true,
            data: candidate,
            message: 'Candidat créé avec succès'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du candidat'
        });
    }
});
// PUT /candidates/:id - Mettre à jour un candidat
router.put('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const { name, election_id, party } = req.body;
        const candidate = await Candidate_1.default.findByIdAndUpdate(req.params.id, {
            name,
            election: election_id,
            party: party || null
        }, { new: true, runValidators: true })
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidat non trouvé'
            });
        }
        res.json({
            success: true,
            data: candidate,
            message: 'Candidat mis à jour avec succès'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du candidat'
        });
    }
});
// DELETE /candidates/:id - Supprimer un candidat
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const candidate = await Candidate_1.default.findByIdAndDelete(req.params.id);
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidat non trouvé'
            });
        }
        res.json({
            success: true,
            message: 'Candidat supprimé avec succès'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du candidat'
        });
    }
});
exports.default = router;
