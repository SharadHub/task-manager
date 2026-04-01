import { Router } from 'express';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Apply middleware to all routes
router.use(authenticateToken);

// Get tasks (TENANT ISOLATED by workspace_id)
router.get('/', async (req, res) => {
    try {
        const workspaceId = req.user?.workspaceId;
        const result = await pool.query(
            'SELECT * FROM tasks WHERE workspace_id = $1 ORDER BY created_at DESC',
            [workspaceId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Create task
router.post('/', async (req, res) => {
    try {
        const workspaceId = req.user?.workspaceId;
        const { title, description } = req.body;
        const id = uuidv4();

        const result = await pool.query(
            'INSERT INTO tasks (id, workspace_id, title, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, workspaceId, title, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// Update task status
router.put('/:id/status', async (req, res) => {
    try {
        const workspaceId = req.user?.workspaceId;
        const taskId = req.params.id;
        const { status } = req.body;

        const result = await pool.query(
            'UPDATE tasks SET status = $1 WHERE id = $2 AND workspace_id = $3 RETURNING *',
            [status, taskId, workspaceId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found or access denied' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Delete task
router.delete('/:id', async (req, res) => {
    try {
        const workspaceId = req.user?.workspaceId;
        const taskId = req.params.id;

        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 AND workspace_id = $2 RETURNING *',
            [taskId, workspaceId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found or access denied' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

export default router;
