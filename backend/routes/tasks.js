const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created
 */

// Get all tasks (users see their own, admins see all)
router.get('/', authenticateToken, (req, res) => {
  try {
    let query = 'SELECT * FROM tasks';
    let params = [];
    if (req.user.role !== 'admin') {
      query += ' WHERE user_id = ?';
      params = [req.user.id];
    }
    query += ' ORDER BY created_at DESC';
    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(rows || []);
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create task
router.post('/', authenticateToken, [
  body('title').isLength({ min: 1 }).trim().escape(),
  body('description').optional().trim().escape(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description } = req.body;
  try {
    db.run(
      'INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)',
      [title, description, req.user.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Server error' });
        }
        res.status(201).json({
          id: this.lastID,
          title,
          description,
          user_id: req.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */

// Update task (only own or admin)
router.put('/:id', authenticateToken, [
  body('title').optional().isLength({ min: 1 }).trim().escape(),
  body('description').optional().trim().escape(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { title, description } = req.body;
  try {
    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, task) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      if (!task) return res.status(404).json({ error: 'Task not found' });
      if (req.user.role !== 'admin' && task.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      let query = 'UPDATE tasks SET';
      let params = [];
      let setParts = [];

      if (title !== undefined) {
        setParts.push(' title = ?');
        params.push(title);
      }
      if (description !== undefined) {
        setParts.push(' description = ?');
        params.push(description);
      }
      setParts.push(' updated_at = CURRENT_TIMESTAMP');

      query += setParts.join(',') + ' WHERE id = ?';
      params.push(id);

      db.run(query, params, function(err) {
        if (err) {
          return res.status(500).json({ error: 'Server error' });
        }
        db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, updatedTask) => {
          if (err) return res.status(500).json({ error: 'Server error' });
          res.json(updatedTask);
        });
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete task (only own or admin)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  try {
    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, task) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      if (!task) return res.status(404).json({ error: 'Task not found' });
      if (req.user.role !== 'admin' && task.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Server error' });
        }
        res.json({ message: 'Task deleted' });
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /tasks/admin/all:
 *   get:
 *     summary: Get all tasks (admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all tasks for admin users
 *       403:
 *         description: Forbidden
 */
// Admin-only task listing
router.get('/admin/all', authenticateToken, authorizeRole(['admin']), (req, res) => {
  try {
    const query = `SELECT tasks.*, users.username AS owner FROM tasks JOIN users ON tasks.user_id = users.id ORDER BY tasks.created_at DESC`;
    db.all(query, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(rows || []);
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;