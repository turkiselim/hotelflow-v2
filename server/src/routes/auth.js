// server/src/routes/auth.js
// Routes : Inscription, Connexion, Profil

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ─── VALIDATION ───
const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit faire au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères'),
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

// ─── POST /api/auth/register ───
// Créer un nouveau compte
router.post('/register', async (req, res) => {
  try {
    // Valider les données
    const data = registerSchema.parse(req.body);

    // Vérifier si l'email existe déjà
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true, role: true, avatar: true }
    });

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({ user, token });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erreur register:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/auth/login ───
// Se connecter
router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // Mettre à jour le statut en ligne
    await prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true }
    });

    // Générer le token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── GET /api/auth/me ───
// Obtenir le profil de l'utilisateur connecté
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, avatar: true, isOnline: true }
    });

    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(user);

  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
