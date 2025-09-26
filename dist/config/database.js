"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let isConnected = false;
const connectDB = async () => {
    if (isConnected) {
        console.log('MongoDB déjà connecté');
        return;
    }
    console.log('Tentative de connexion à MongoDB...');
    try {
        const mongoURI = "mongodb+srv://piouhassan:1012moiHassan@cluster0.ksf1nrb.mongodb.net/colelectra?retryWrites=true&w=majority";
        console.log('URI MongoDB:', mongoURI.replace(/:[^@]*@/, ':***@'));

        await mongoose_1.default.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
            maxPoolSize: 5,
            minPoolSize: 1
        });

        // Test rapide
        await mongoose_1.default.connection.db.admin().ping();

        isConnected = true;
        console.log('✅ MongoDB connecté avec succès');
    }
    catch (error) {
        console.error('❌ Erreur de connexion MongoDB:', error.message);
        console.error('⚠️ Mode fallback activé - API fonctionnelle sans DB');
        // Ne pas throw l'erreur pour permettre à l'API de fonctionner
        isConnected = false;
    }
};
exports.default = connectDB;
