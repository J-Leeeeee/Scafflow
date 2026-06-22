import { Router } from 'express';
import { requireAuth } from '../auth/middleware';
import { asyncHandler } from '../asyncHandler';
import { postHint } from './handler';

const router = Router();

router.post('/', requireAuth, asyncHandler(postHint));

export default router;
