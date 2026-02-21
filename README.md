# HôtelFlow v2 — Application complète

Application professionnelle de gestion de projets et tâches.

## 🚀 Lancement rapide (5 étapes)

### Prérequis : Node.js v20+, PostgreSQL 18

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer la base de données
```bash
cp server/.env.example server/.env
```
Ouvrez `server/.env` et modifiez `DATABASE_URL` :
```
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/teamflow"
```

### 3. Créer les tables + données de démo
```bash
cd server
npx prisma migrate dev --name init
npm run db:seed
cd ..
```

### 4. Lancer l'application
```bash
npm run dev
```

### 5. Ouvrir dans le navigateur
- **Frontend** : http://localhost:5173
- **Backend**  : http://localhost:3001/health

## 🔐 Comptes de démonstration
| Email | Mot de passe | Rôle |
|-------|-------------|------|
| alex@teamflow.dev | password123 | 👑 Admin |
| sophie@teamflow.dev | password123 | 🎯 Chef de projet |
| thomas@teamflow.dev | password123 | 👤 Membre |

## ✨ Fonctionnalités
- **5 vues** : Kanban, Liste, Tableau, Chronologie, Calendrier
- **Dashboard complet** : KPIs, avancement projets, charge équipe, tâches urgentes
- **Gestion des membres** : invitation par email, rôles, départements
- **Tâches avancées** : priorités, tags, départements, progression, commentaires
- **Temps réel** : Socket.io pour les mises à jour live
