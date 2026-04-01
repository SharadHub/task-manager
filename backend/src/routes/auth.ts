import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/register', async (req, res) => {
    const { email, password, name, workspaceName } = req.body;

    try {
        await pool.query('BEGIN');

        // 1. Create Workspace
        const workspaceId = uuidv4();
        await pool.query(
            'INSERT INTO workspaces (id, name) VALUES ($1, $2)',
            [workspaceId, workspaceName]
        );

        // 2. Create User
        const userId = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (id, workspace_id, email, password_hash, name) VALUES ($1, $2, $3, $4, $5)',
            [userId, workspaceId, email, hashedPassword, name]
        );

        await pool.query('COMMIT');

        // 3. Generate Token
        const token = jwt.sign(
            { userId, workspaceId },
            process.env.JWT_SECRET || 'super_secret_jwt_key',
            { expiresIn: '1d' }
        );

        res.status(201).json({ token, workspaceId, userId });
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, workspaceId: user.workspace_id },
            process.env.JWT_SECRET || 'super_secret_jwt_key',
            { expiresIn: '1d' }
        );

        res.json({ token, workspaceId: user.workspace_id, userId: user.id });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;
