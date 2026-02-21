// server/src/routes/tasks.js
// Routes CRUD pour les tâches + émission temps réel

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { z } = require('zod');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

const taskSchema = z.object({
  title:       z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  status:      z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
  priority:    z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  tag:         z.string().optional(),
  progress:    z.number().min(0).max(100).optional(),
  startDate:   z.string().optional(),
  dueDate:     z.string().optional(),
  projectId:   z.string(),
  department:  z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
});

// ─── POST /api/tasks ───
// Créer une tâche
router.post('/', async (req, res) => {
  try {
    const data = taskSchema.parse(req.body);
    const io = req.app.get('io');

    const task = await prisma.task.create({
      data: {
        title:       data.title,
        description: data.description,
        status:      data.status || 'TODO',
        priority:    data.priority || 'NORMAL',
        tag:         data.tag,
        department:  data.department,
        progress:    data.progress || 0,
        startDate:   data.startDate ? new Date(data.startDate) : undefined,
        dueDate:     data.dueDate ? new Date(data.dueDate) : undefined,
        project:     { connect: { id: data.projectId } },
        assignees:   data.assigneeIds
          ? { connect: data.assigneeIds.map(id => ({ id })) }
          : undefined,
      },
      include: {
        assignees: { select: { id: true, name: true, avatar: true } },
        _count: { select: { comments: true } }
      }
    });

    // Notifier tous les membres du projet en temps réel
    io.to(`project:${data.projectId}`).emit('task:created', task);

    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── PATCH /api/tasks/:id ───
// Modifier une tâche (statut, titre, priorité, etc.)
router.patch('/:id', async (req, res) => {
  try {
    const io = req.app.get('io');
    const updateData = taskSchema.partial().parse(req.body);

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title:       updateData.title,
        description: updateData.description,
        status:      updateData.status,
        priority:    updateData.priority,
        tag:         updateData.tag,
        department:  updateData.department,
        progress:    updateData.progress,
        startDate:   updateData.startDate ? new Date(updateData.startDate) : undefined,
        dueDate:     updateData.dueDate ? new Date(updateData.dueDate) : undefined,
        assignees:   updateData.assigneeIds
          ? { set: updateData.assigneeIds.map(id => ({ id })) }
          : undefined,
      },
      include: {
        assignees: { select: { id: true, name: true, avatar: true } },
        project:   { select: { id: true } }
      }
    });

    // Notifier en temps réel
    io.to(`project:${task.project.id}`).emit('task:updated', task);

    res.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── DELETE /api/tasks/:id ───
router.delete('/:id', async (req, res) => {
  try {
    const io = req.app.get('io');
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      select: { projectId: true }
    });

    await prisma.task.delete({ where: { id: req.params.id } });
    io.to(`project:${task.projectId}`).emit('task:deleted', { id: req.params.id });

    res.json({ message: 'Tâche supprimée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── POST /api/tasks/:id/comments ───
// Ajouter un commentaire à une tâche
router.post('/:id/comments', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Contenu requis' });

    const comment = await prisma.comment.create({
      data: {
        content,
        author: { connect: { id: req.user.id } },
        task:   { connect: { id: req.params.id } },
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ─── GET /api/tasks/:id/comments ───
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { taskId: req.params.id },
      include: { author: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
