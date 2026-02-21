// server/src/sockets/tasks.js
// Gestion des mises à jour de tâches en temps réel

const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Namespace pour les tâches
  const tasksNS = io.of('/tasks');

  tasksNS.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Non authentifié'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Token invalide'));
    }
  });

  tasksNS.on('connection', (socket) => {
    // L'utilisateur rejoint les rooms de ses projets
    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`);
    });

    // Déplacement d'une carte Kanban (drag & drop)
    socket.on('task:move', ({ taskId, newStatus, projectId }) => {
      // Diffuser aux autres membres (pas à l'émetteur)
      socket.to(`project:${projectId}`).emit('task:moved', { taskId, newStatus });
    });

    socket.on('disconnect', () => {});
  });
};
