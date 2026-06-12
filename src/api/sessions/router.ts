import { Router } from 'express';
import { requireAuth } from '../auth/middleware';
import { createSession, getSessionState, endSession } from './handler';

const router = Router();

router.post('/',                requireAuth, createSession);
router.get('/:id',              requireAuth, getSessionState);
router.post('/:id/end',         requireAuth, endSession);

export default router;
