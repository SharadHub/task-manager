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
const db_1 = __importDefault(require("../db"));
const auth_1 = require("../middleware/auth");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
// Apply middleware to all routes
router.use(auth_1.authenticateToken);
// Get tasks (TENANT ISOLATED by workspace_id)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const workspaceId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.workspaceId;
        const result = yield db_1.default.query('SELECT * FROM tasks WHERE workspace_id = $1 ORDER BY created_at DESC', [workspaceId]);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
}));
// Create task
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const workspaceId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.workspaceId;
        const { title, description } = req.body;
        const id = (0, uuid_1.v4)();
        const result = yield db_1.default.query('INSERT INTO tasks (id, workspace_id, title, description) VALUES ($1, $2, $3, $4) RETURNING *', [id, workspaceId, title, description]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
    }
}));
// Update task status
router.put('/:id/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const workspaceId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.workspaceId;
        const taskId = req.params.id;
        const { status } = req.body;
        const result = yield db_1.default.query('UPDATE tasks SET status = $1 WHERE id = $2 AND workspace_id = $3 RETURNING *', [status, taskId, workspaceId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found or access denied' });
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
}));
// Delete task
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const workspaceId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.workspaceId;
        const taskId = req.params.id;
        const result = yield db_1.default.query('DELETE FROM tasks WHERE id = $1 AND workspace_id = $2 RETURNING *', [taskId, workspaceId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found or access denied' });
        }
        res.json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
}));
exports.default = router;
