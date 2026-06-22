import { Router } from 'express';
import { requireAuth } from '../auth/middleware';
import { asyncHandler } from '../asyncHandler';
import { logEvent } from './handler';

const router = Router();

router.post('/', requireAuth, asyncHandler(logEvent));

export default router;
