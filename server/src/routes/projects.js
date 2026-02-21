// server/src/routes/projects.js
// Routes CRUD pour les projets

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { z } = require('zod');

const router = express.Router();
const prisma = new PrismaClient();

// Toutes les routes projets nécessitent d'être connecté
router.use(authMiddleware);

const projectSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  color: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
});

// ─── GET /api/projects ───
// Lister les projets de l'utilisateur connecté
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { id: req.user.id } } }
        ]
      },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        members: { select: { id: true, name: true, avatar: true, isOnline: true } },
        _count: { select: { tasks: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/projects ───
// Créer un projet
router.post('/', async (req, res) => {
  try {
    const data = projectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || '#6c63ff',
        owner: { connect: { id: req.user.id } },
        members: data.memberIds
          ? { connect: data.memberIds.map(id => ({ id })) }
          : undefined,
      },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        members: { select: { id: true, name: true, avatar: true } },
      }
    });

    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── GET /api/projects/:id ───
// Détail d'un projet
router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        members: { select: { id: true, name: true, avatar: true, isOnline: true } },
        tasks: {
          include: {
            assignees: { select: { id: true, name: true, avatar: true } },
            _count: { select: { comments: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) return res.status(404).json({ error: 'Projet introuvable' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── PATCH /api/projects/:id ───
// Modifier un projet
router.patch('/:id', async (req, res) => {
  try {
    const data = projectSchema.partial().parse(req.body);
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
      },
      include: {
        members: { select: { id: true, name: true, avatar: true } }
      }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── DELETE /api/projects/:id ───
// Supprimer un projet
router.delete('/:id', async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Projet supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
