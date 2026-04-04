import express from 'express';
import {
  assignLead,
  getLeadMessages,
  listLeads,
  updateLeadStatus,
} from '../../controllers/leadsController.js';
import { requireAdmin } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', listLeads);
router.get('/:leadId/messages', getLeadMessages);
router.patch('/:leadId/status', updateLeadStatus);
router.patch('/:leadId/assign', requireAdmin, assignLead);

export default router;
