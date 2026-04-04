import express from 'express';
import { createAgent, listAgents } from '../../controllers/usersController.js';
import { requireAdmin } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', requireAdmin, listAgents);
router.post('/agents', requireAdmin, createAgent);

export default router;
