import { Router } from 'express';
import { requireAuth } from '../auth/middleware';
import { asyncHandler } from '../asyncHandler';
import { listHomeworkSets } from './handler';

const router = Router();

router.get('/', requireAuth, asyncHandler(listHomeworkSets));

export default router;
