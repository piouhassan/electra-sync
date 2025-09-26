"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const Election_1 = __importDefault(require("../models/Election"));
const PollingStation_1 = __importDefault(require("../models/PollingStation"));
const Candidate_1 = __importDefault(require("../models/Candidate"));
const types_1 = require("../types");
dotenv_1.default.config();
const seedData = async () => {
    try {
        console.log('🌱 Démarrage du seeding...');
        // Connexion à MongoDB
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI non définie');
        }
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('✅ Connecté à MongoDB');
        // Nettoyer les données existantes
        await User_1.default.deleteMany({});
        await Election_1.default.deleteMany({});
        await PollingStation_1.default.deleteMany({});
        await Candidate_1.default.deleteMany({});
        console.log('🗑️ Données existantes supprimées');
        // Créer les utilisateurs
        const users = await User_1.default.create([
            {
                name: 'Admin Principal',
                email: 'admin@electra.com',
                code: 'admin123',
                role: types_1.Role.ADMIN
            },
            {
                name: 'Membre Bureau',
                email: 'bureau@electra.com',
                code: 'bureau123',
                role: types_1.Role.BOARD
            },
            {
                name: 'Électeur Test',
                email: 'voter@electra.com',
                code: 'voter123',
                role: types_1.Role.VOTER
            }
        ]);
        console.log('👥 Utilisateurs créés');
        // Créer les bureaux de vote
        const pollingStations = await PollingStation_1.default.create([
            {
                name: 'Bureau Central',
                location: 'Centre-ville'
            },
            {
                name: 'Bureau Nord',
                location: 'Quartier Nord'
            },
            {
                name: 'Bureau Sud',
                location: 'Quartier Sud'
            }
        ]);
        console.log('🏢 Bureaux de vote créés');
        // Créer une élection
        const election = await Election_1.default.create({
            title: 'Élection Présidentielle 2024',
            description: 'Élection présidentielle de test',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            status: types_1.ElectionStatus.OPEN
        });
        console.log('🗳️ Élection créée');
        // Créer les candidats
        await Candidate_1.default.create([
            {
                name: 'Candidat A',
                electionId: election._id,
                pollingStationId: pollingStations[0]._id
            },
            {
                name: 'Candidat B',
                electionId: election._id,
                pollingStationId: pollingStations[1]._id
            },
            {
                name: 'Candidat C',
                electionId: election._id,
                pollingStationId: pollingStations[2]._id
            }
        ]);
        console.log('🤵 Candidats créés');
        console.log('✅ Seeding terminé avec succès!');
        console.log('\n📋 Comptes créés:');
        console.log('Admin: admin@electra.com / admin123');
        console.log('Bureau: bureau@electra.com / bureau123');
        console.log('Voter: voter@electra.com / voter123');
    }
    catch (error) {
        console.error('❌ Erreur lors du seeding:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('🔌 Déconnecté de MongoDB');
        process.exit(0);
    }
};
// Exécuter le seeding
if (require.main === module) {
    seedData();
}
