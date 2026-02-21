// server/src/index.js
// Point d'entrée principal du serveur TeamFlow

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

// ─── INIT ───
const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

// ─── SOCKET.IO (Temps réel) ───
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Rendre io accessible dans les routes
app.set('io', io);

// ─── MIDDLEWARES ───
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ─── ROUTES ───
const authRoutes    = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes    = require('./routes/tasks');
const userRoutes    = require('./routes/users');

app.use('/api/auth',     authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks',    taskRoutes);
app.use('/api/users',    userRoutes);

// Route de santé (pour vérifier que le serveur tourne)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'TeamFlow API is running 🚀' });
});

// ─── WEBSOCKET EVENTS ───
require('./sockets/chat')(io);
require('./sockets/tasks')(io);

// ─── DÉMARRAGE ───
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 Serveur TeamFlow démarré sur http://localhost:${PORT}`);
  console.log(`📡 WebSocket actif`);
  console.log(`🗄️  Base de données : ${process.env.DATABASE_URL ? 'Connectée' : '⚠️ DATABASE_URL manquante'}\n`);
});

// Fermeture propre
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
