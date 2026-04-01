import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthPayload {
    userId: string;
    workspaceId: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }

    try {
        const secret = process.env.JWT_SECRET || 'super_secret_jwt_key';
        const decoded = jwt.verify(token, secret) as AuthPayload;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }
};
