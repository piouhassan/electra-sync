"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const Vote_1 = __importDefault(require("../models/Vote"));
const Result_1 = __importDefault(require("../models/Result"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /votes - Récupérer tous les votes
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const votes = await Vote_1.default.find()
            .populate('userId', 'name email')
            .populate('electionId', 'title')
            .populate('candidateId', 'name')
            .populate('pollingStationId', 'name location');
        res.json({
            success: true,
            data: votes
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des votes'
        });
    }
});
// GET /votes/:id - Récupérer un vote par ID
router.get('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const vote = await Vote_1.default.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('electionId', 'title')
            .populate('candidateId', 'name')
            .populate('pollingStationId', 'name location');
        if (!vote) {
            return res.status(404).json({
                success: false,
                message: 'Vote non trouvé'
            });
        }
        res.json({
            success: true,
            data: vote
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du vote'
        });
    }
});
// GET /votes/election/:electionId - Récupérer les votes d'une élection
router.get('/election/:electionId', auth_1.requireAuth, async (req, res) => {
    try {
        const votes = await Vote_1.default.find({ electionId: req.params.electionId })
            .populate('userId', 'name email')
            .populate('candidateId', 'name')
            .populate('pollingStationId', 'name location');
        res.json({
            success: true,
            data: votes
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des votes'
        });
    }
});
// POST /votes - Créer un nouveau vote et mettre à jour les résultats
router.post('/', auth_1.requireAuth, async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { user_id, election_id, candidate_id, polling_station_id } = req.body;
        // Vérifier si l'utilisateur a déjà voté pour cette élection
        const existingVote = await Vote_1.default.findOne({
            userId: user_id,
            electionId: election_id
        }).session(session);
        if (existingVote) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'L\'utilisateur a déjà voté pour cette élection'
            });
        }
        // Créer le vote
        const vote = new Vote_1.default({
            userId: user_id,
            electionId: election_id,
            candidateId: candidate_id,
            pollingStationId: polling_station_id || null
        });
        await vote.save({ session });
        // Mettre à jour ou créer le résultat
        const existingResult = await Result_1.default.findOne({
            electionId: election_id,
            candidateId: candidate_id
        }).session(session);
        if (existingResult) {
            await Result_1.default.findByIdAndUpdate(existingResult._id, { $inc: { totalVotes: 1 } }, { session });
        }
        else {
            const newResult = new Result_1.default({
                electionId: election_id,
                candidateId: candidate_id,
                totalVotes: 1
            });
            await newResult.save({ session });
        }
        await session.commitTransaction();
        session.endSession();
        // Populate le vote pour la réponse
        await vote.populate('userId', 'name email');
        await vote.populate('electionId', 'title');
        await vote.populate('candidateId', 'name');
        if (polling_station_id) {
            await vote.populate('pollingStationId', 'name location');
        }
        res.status(201).json({
            success: true,
            data: vote,
            message: 'Vote enregistré avec succès'
        });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'enregistrement du vote'
        });
    }
});
// PUT /votes/:id - Mettre à jour un vote
router.put('/:id', auth_1.requireAuth, async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { candidate_id, polling_station_id } = req.body;
        // Récupérer le vote original
        const originalVote = await Vote_1.default.findById(req.params.id).session(session);
        if (!originalVote) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Vote non trouvé'
            });
        }
        const originalCandidateId = originalVote.candidateId;
        // Mettre à jour le vote
        const updatedVote = await Vote_1.default.findByIdAndUpdate(req.params.id, {
            candidateId: candidate_id || originalVote.candidateId,
            pollingStationId: polling_station_id !== undefined ? polling_station_id : originalVote.pollingStationId
        }, { new: true, runValidators: true, session });
        // Si le candidat a changé, mettre à jour les résultats
        if (candidate_id && candidate_id !== originalCandidateId.toString()) {
            // Décrémenter l'ancien candidat
            await Result_1.default.findOneAndUpdate({ electionId: originalVote.electionId, candidateId: originalCandidateId }, { $inc: { totalVotes: -1 } }, { session });
            // Incrémenter le nouveau candidat
            const existingResult = await Result_1.default.findOne({
                electionId: originalVote.electionId,
                candidateId: candidate_id
            }).session(session);
            if (existingResult) {
                await Result_1.default.findByIdAndUpdate(existingResult._id, { $inc: { totalVotes: 1 } }, { session });
            }
            else {
                const newResult = new Result_1.default({
                    electionId: originalVote.electionId,
                    candidateId: candidate_id,
                    totalVotes: 1
                });
                await newResult.save({ session });
            }
        }
        await session.commitTransaction();
        session.endSession();
        // Populate pour la réponse
        await updatedVote.populate('userId', 'name email');
        await updatedVote.populate('electionId', 'title');
        await updatedVote.populate('candidateId', 'name');
        if (updatedVote.pollingStationId) {
            await updatedVote.populate('pollingStationId', 'name location');
        }
        res.json({
            success: true,
            data: updatedVote,
            message: 'Vote mis à jour avec succès'
        });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du vote'
        });
    }
});
// DELETE /votes/:id - Supprimer un vote et mettre à jour les résultats
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const vote = await Vote_1.default.findById(req.params.id).session(session);
        if (!vote) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Vote non trouvé'
            });
        }
        // Supprimer le vote
        await Vote_1.default.findByIdAndDelete(req.params.id).session(session);
        // Décrémenter le résultat
        await Result_1.default.findOneAndUpdate({ electionId: vote.electionId, candidateId: vote.candidateId }, { $inc: { totalVotes: -1 } }, { session });
        await session.commitTransaction();
        session.endSession();
        res.json({
            success: true,
            message: 'Vote supprimé avec succès'
        });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du vote'
        });
    }
});
exports.default = router;
