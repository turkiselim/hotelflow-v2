const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();
router.use(authMiddleware);

// GET /api/users/team — liste équipe avec stats
router.get('/team', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, avatar: true, role: true, isOnline: true, createdAt: true,
        _count: { select: { assignedTasks: true, comments: true } }
      },
      orderBy: { name: 'asc' }
    });
    res.json(users);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

// GET /api/users/:id — profil complet avec tâches et projets
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, email: true, avatar: true, role: true, isOnline: true, createdAt: true,
        assignedTasks: {
          include: {
            project: { select: { id: true, name: true, color: true } },
          },
          orderBy: { createdAt: 'desc' }
        },
        memberProjects: { select: { id: true, name: true, color: true } },
        _count: { select: { assignedTasks: true, comments: true, memberProjects: true } }
      }
    });
    if (!user) return res.status(404).json({ error: 'Introuvable' });
    res.json(user);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
});

// PATCH /api/users/me — modifier son profil
router.patch('/me', async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, avatar },
      select: { id: true, name: true, email: true, avatar: true, role: true }
    });
    res.json(user);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

// PATCH /api/users/:id/role — changer rôle (admin only)
router.patch('/:id/role', async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Accès refusé' });
    const { role } = req.body;
    if (!['ADMIN', 'PROJECT_MANAGER', 'MEMBER'].includes(role)) return res.status(400).json({ error: 'Rôle invalide' });
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });
    res.json(user);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

// DELETE /api/users/:id — supprimer membre (admin only)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Accès refusé' });
    if (req.user.id === req.params.id) return res.status(400).json({ error: 'Impossible de se supprimer soi-même' });
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'Membre supprimé' });
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
});

// POST /api/users/invite — inviter un nouveau membre (admin only)
router.post('/invite', async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { email, name, role, department } = req.body;
    
    // Vérifier si l'email existe déjà
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Générer un mot de passe temporaire aléatoire
    const bcrypt = require('bcryptjs');
    const temporaryPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10).toUpperCase();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        role: role || 'MEMBER',
      },
      select: { id: true, name: true, email: true, role: true }
    });

    // Envoyer l'email d'invitation
    const { sendInvitation } = require('../services/email');
    const inviter = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    await sendInvitation({
      email: newUser.email,
      name: newUser.name,
      inviterName: inviter.name,
      hotelName: 'Médina Bélisaire & Thalasso',
      invitationLink: process.env.CLIENT_URL || 'http://localhost:5173',
      temporaryPassword,
    });

    res.status(201).json({ 
      message: 'Invitation envoyée avec succès',
      user: newUser 
    });

  } catch (error) {
    console.error('Erreur invitation:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'invitation' });
  }
});
// PATCH /api/users/me/password — changer son mot de passe
router.patch('/me/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    }

    // Récupérer l'utilisateur avec son mot de passe
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id },
      select: { id: true, password: true }
    });

    // Vérifier le mot de passe actuel
    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Mettre à jour
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Mot de passe modifié avec succès' });

  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;

