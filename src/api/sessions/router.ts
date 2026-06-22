import { Router } from 'express';
import { requireAuth } from '../auth/middleware';
import { asyncHandler } from '../asyncHandler';
import { createSession, getSessionState, endSession } from './handler';

const router = Router();

router.post('/',                requireAuth, asyncHandler(createSession));
router.get('/:id',              requireAuth, asyncHandler(getSessionState));
router.post('/:id/end',         requireAuth, asyncHandler(endSession));

export default router;
