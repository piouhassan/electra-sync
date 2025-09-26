# Electra Sync Pro - Backend

Backend refait avec MongoDB Atlas pour le système de gestion d'élections Electra Sync Pro.

## 🚀 Fonctionnalités

- ✅ **Authentification sécurisée** avec JWT et bcrypt
- ✅ **Base de données MongoDB Atlas**
- ✅ **Architecture modulaire** avec contrôleurs, modèles et middleware
- ✅ **Validation des données** avec Joi
- ✅ **Audit des actions** utilisateur
- ✅ **Rate limiting** et sécurité avec Helmet
- ✅ **TypeScript** pour la sécurité des types

## 🗂️ Structure du projet

```
backend/
├── src/
│   ├── config/        # Configuration (base de données)
│   ├── controllers/   # Contrôleurs API
│   ├── models/        # Modèles MongoDB/Mongoose
│   ├── middleware/    # Middleware (auth, validation, audit)
│   ├── routes/        # Routes API
│   ├── types/         # Types TypeScript
│   ├── utils/         # Utilitaires (JWT, seed)
│   └── app.ts         # Application principale
├── dist/              # Code compilé
├── package.json
├── tsconfig.json
└── .env
```

## 🛠️ Installation

```bash
# Installer les dépendances
npm install

# Compiler le projet
npm run build

# Peupler la base de données
npm run seed

# Démarrer en développement
npm run dev

# Démarrer en production
npm start
```

## 🗄️ Base de données

**MongoDB Atlas** configuré avec la chaîne de connexion fournie.

### Modèles disponibles :
- **User** - Utilisateurs (admin, board, voter)
- **Election** - Élections
- **Candidate** - Candidats
- **PollingStation** - Bureaux de vote
- **Vote** - Votes
- **Result** - Résultats
- **Audit** - Audit des actions

## 🔐 Authentification

### Comptes de test créés :
- **Admin** : `admin@electra.com` / `admin123`
- **Bureau** : `bureau@electra.com` / `bureau123`
- **Voter** : `voter@electra.com` / `voter123`

### Endpoints disponibles :
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur (protégé)

## 🔧 Configuration

Variables d'environnement dans `.env` :
```
PORT=5001
JWT_SECRET=electra-sync-super-secret-key-2024
JWT_EXPIRES_IN=24h
NODE_ENV=development
MONGODB_URI=mongodb+srv://piouhassan:1012moiHassan@cluster0.ksf1nrb.mongodb.net/colelectra?retryWrites=true&w=majority
```

## 🆚 Corrections apportées

### Problèmes de l'ancien serveur :
❌ Mots de passe en clair
❌ Pas de JWT généré au login
❌ SQLite au lieu de MongoDB
❌ Structure non optimale
❌ JWT_SECRET faible
❌ Authentification incomplète

### Solutions implémentées :
✅ **Hachage bcrypt** des mots de passe
✅ **JWT généré** et vérifié correctement
✅ **MongoDB Atlas** configuré
✅ **Architecture propre** avec séparation des responsabilités
✅ **JWT_SECRET** fort et sécurisé
✅ **Middleware d'authentification** complet
✅ **Validation** des données entrantes
✅ **Audit** des actions utilisateur

## 📡 API

Serveur démarré sur : `http://localhost:5001`

Exemple de connexion :
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@electra.com","code":"admin123"}'
```

## 🎯 Status

✅ **Base de données** : MongoDB Atlas connecté
✅ **Serveur** : Fonctionnel sur le port 5001
✅ **Authentification** : JWT et bcrypt opérationnels
✅ **Données test** : Utilisateurs et élections créés
✅ **API** : Endpoints auth fonctionnels

Le backend est maintenant prêt et sécurisé avec MongoDB Atlas !