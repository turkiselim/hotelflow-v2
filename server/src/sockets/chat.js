// server/src/sockets/chat.js
// Gestion du chat en temps réel avec Socket.io

const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

module.exports = (io) => {
  // Namespace pour le chat
  const chatNS = io.of('/chat');

  chatNS.use((socket, next) => {
    // Vérifier le token JWT à la connexion WebSocket
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Non authentifié'));

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = user;
      next();
    } catch {
      next(new Error('Token invalide'));
    }
  });

  chatNS.on('connection', (socket) => {
    console.log(`💬 Utilisateur connecté au chat : ${socket.user.email}`);

    // Rejoindre la room d'un projet
    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`);
    });

    // Quitter la room d'un projet
    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    // Envoyer un message
    socket.on('message:send', async ({ projectId, content }) => {
      try {
        if (!content || !projectId) return;

        // Sauvegarder en base de données
        const message = await prisma.message.create({
          data: {
            content,
            author:  { connect: { id: socket.user.id } },
            project: { connect: { id: projectId } },
          },
          include: {
            author: { select: { id: true, name: true, avatar: true } }
          }
        });

        // Diffuser à tous les membres du projet
        chatNS.to(`project:${projectId}`).emit('message:received', message);

      } catch (error) {
        socket.emit('error', { message: 'Erreur lors de l\'envoi du message' });
      }
    });

    // Indicateur "est en train d'écrire..."
    socket.on('typing:start', ({ projectId }) => {
      socket.to(`project:${projectId}`).emit('typing:update', {
        userId: socket.user.id,
        name: socket.user.name,
        isTyping: true
      });
    });

    socket.on('typing:stop', ({ projectId }) => {
      socket.to(`project:${projectId}`).emit('typing:update', {
        userId: socket.user.id,
        isTyping: false
      });
    });

    socket.on('disconnect', async () => {
      // Mettre à jour le statut hors ligne
      await prisma.user.update({
        where: { id: socket.user.id },
        data: { isOnline: false }
      }).catch(() => {});
      console.log(`👋 Utilisateur déconnecté : ${socket.user.email}`);
    });
  });
};
