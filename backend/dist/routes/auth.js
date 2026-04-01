"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, workspaceName } = req.body;
    try {
        yield db_1.default.query('BEGIN');
        // 1. Create Workspace
        const workspaceId = (0, uuid_1.v4)();
        yield db_1.default.query('INSERT INTO workspaces (id, name) VALUES ($1, $2)', [workspaceId, workspaceName]);
        // 2. Create User
        const userId = (0, uuid_1.v4)();
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        yield db_1.default.query('INSERT INTO users (id, workspace_id, email, password_hash, name) VALUES ($1, $2, $3, $4, $5)', [userId, workspaceId, email, hashedPassword, name]);
        yield db_1.default.query('COMMIT');
        // 3. Generate Token
        const token = jsonwebtoken_1.default.sign({ userId, workspaceId }, process.env.JWT_SECRET || 'super_secret_jwt_key', { expiresIn: '1d' });
        res.status(201).json({ token, workspaceId, userId });
    }
    catch (error) {
        yield db_1.default.query('ROLLBACK');
        res.status(500).json({ error: 'Registration failed' });
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const result = yield db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValidPassword = yield bcrypt_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, workspaceId: user.workspace_id }, process.env.JWT_SECRET || 'super_secret_jwt_key', { expiresIn: '1d' });
        res.json({ token, workspaceId: user.workspace_id, userId: user.id });
    }
    catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
}));
exports.default = router;
