"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Result_1 = __importDefault(require("../models/Result"));
const Election_1 = __importDefault(require("../models/Election"));
const Vote_1 = __importDefault(require("../models/Vote"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /results - Récupérer tous les résultats
router.get('/', async (req, res) => {
    try {
        const results = await Result_1.default.find()
            .populate('electionId', 'title description status')
            .populate('candidateId', 'name')
            .sort({ 'electionId.title': 1, totalVotes: -1 });
        res.json({
            success: true,
            data: results
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des résultats'
        });
    }
});
// GET /results/:id - Récupérer un résultat par ID
router.get('/:id', async (req, res) => {
    try {
        const result = await Result_1.default.findById(req.params.id)
            .populate('electionId', 'title description status')
            .populate('candidateId', 'name');
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Résultat non trouvé'
            });
        }
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du résultat'
        });
    }
});
// GET /results/election/:electionId - Récupérer les résultats d'une élection
router.get('/election/:electionId', async (req, res) => {
    try {
        const results = await Result_1.default.find({ electionId: req.params.electionId })
            .populate('candidateId', 'name')
            .sort({ totalVotes: -1 });
        // Calculer les statistiques de l'élection
        const totalVotes = results.reduce((sum, result) => sum + result.totalVotes, 0);
        const resultsWithPercentages = results.map(result => ({
            ...result.toObject(),
            percentage: totalVotes > 0 ? (result.totalVotes / totalVotes * 100).toFixed(2) : '0.00'
        }));
        res.json({
            success: true,
            data: {
                results: resultsWithPercentages,
                summary: {
                    totalVotes,
                    totalCandidates: results.length,
                    winner: results.length > 0 ? results[0].candidateId : null
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des résultats de l\'élection'
        });
    }
});
// GET /results/election/:electionId/by-polling-station - Résultats par bureau de vote
router.get('/election/:electionId/by-polling-station', async (req, res) => {
    try {
        const votes = await Vote_1.default.find({ electionId: req.params.electionId })
            .populate('candidateId', 'name')
            .populate('pollingStationId', 'name location');
        // Grouper les votes par bureau de vote
        const resultsByStation = votes.reduce((acc, vote) => {
            const stationId = vote.pollingStationId?._id?.toString() || 'no-station';
            const stationName = vote.pollingStationId?.name || 'Aucun bureau';
            const candidateId = vote.candidateId._id.toString();
            const candidateName = vote.candidateId.name;
            if (!acc[stationId]) {
                acc[stationId] = {
                    station: {
                        id: stationId,
                        name: stationName,
                        location: vote.pollingStationId?.location || ''
                    },
                    candidates: {},
                    totalVotes: 0
                };
            }
            if (!acc[stationId].candidates[candidateId]) {
                acc[stationId].candidates[candidateId] = {
                    candidate: { id: candidateId, name: candidateName },
                    votes: 0
                };
            }
            acc[stationId].candidates[candidateId].votes++;
            acc[stationId].totalVotes++;
            return acc;
        }, {});
        // Convertir en tableau et ajouter les pourcentages
        const formattedResults = Object.values(resultsByStation).map((station) => ({
            ...station,
            candidates: Object.values(station.candidates).map((candidate) => ({
                ...candidate,
                percentage: station.totalVotes > 0 ?
                    (candidate.votes / station.totalVotes * 100).toFixed(2) : '0.00'
            })).sort((a, b) => b.votes - a.votes)
        }));
        res.json({
            success: true,
            data: formattedResults
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des résultats par bureau de vote'
        });
    }
});
// POST /results/recalculate/:electionId - Recalculer les résultats d'une élection
router.post('/recalculate/:electionId', auth_1.requireAuth, async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé. Admin requis.'
            });
        }
        const electionId = req.params.electionId;
        // Vérifier que l'élection existe
        const election = await Election_1.default.findById(electionId);
        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Élection non trouvée'
            });
        }
        // Supprimer tous les résultats existants pour cette élection
        await Result_1.default.deleteMany({ electionId: electionId });
        // Recalculer les résultats à partir des votes
        const voteAggregation = await Vote_1.default.aggregate([
            { $match: { electionId: electionId } },
            {
                $group: {
                    _id: {
                        electionId: '$electionId',
                        candidateId: '$candidateId'
                    },
                    totalVotes: { $sum: 1 }
                }
            }
        ]);
        // Créer les nouveaux résultats
        const newResults = voteAggregation.map(vote => ({
            electionId: vote._id.electionId,
            candidateId: vote._id.candidateId,
            totalVotes: vote.totalVotes
        }));
        if (newResults.length > 0) {
            await Result_1.default.insertMany(newResults);
        }
        // Récupérer les résultats mis à jour
        const updatedResults = await Result_1.default.find({ electionId: electionId })
            .populate('candidateId', 'name')
            .sort({ totalVotes: -1 });
        res.json({
            success: true,
            data: updatedResults,
            message: 'Résultats recalculés avec succès'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors du recalcul des résultats'
        });
    }
});
// GET /results/election/:electionId/export - Exporter les résultats d'une élection
router.get('/election/:electionId/export', auth_1.requireAuth, async (req, res) => {
    try {
        const format = req.query.format || 'json';
        const results = await Result_1.default.find({ electionId: req.params.electionId })
            .populate('electionId', 'title description')
            .populate('candidateId', 'name')
            .sort({ totalVotes: -1 });
        const election = results[0]?.electionId;
        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Aucun résultat trouvé pour cette élection'
            });
        }
        const totalVotes = results.reduce((sum, result) => sum + result.totalVotes, 0);
        const exportData = {
            election: {
                title: election.title,
                description: election.description,
                exportDate: new Date().toISOString()
            },
            summary: {
                totalVotes,
                totalCandidates: results.length,
                winner: results[0]?.candidateId?.name || null
            },
            results: results.map(result => ({
                candidate: result.candidateId?.name,
                votes: result.totalVotes,
                percentage: totalVotes > 0 ? (result.totalVotes / totalVotes * 100).toFixed(2) + '%' : '0.00%'
            }))
        };
        if (format === 'csv') {
            // Format CSV
            let csv = 'Candidat,Votes,Pourcentage\n';
            exportData.results.forEach(result => {
                csv += `${result.candidate},${result.votes},${result.percentage}\n`;
            });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="results-${req.params.electionId}.csv"`);
            res.send(csv);
        }
        else {
            // Format JSON par défaut
            res.json({
                success: true,
                data: exportData
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'export des résultats'
        });
    }
});
exports.default = router;
