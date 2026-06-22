import { Router } from 'express';
import { requireAuth } from '../auth/middleware';
import { asyncHandler } from '../asyncHandler';
import { acceptConsent, declaration, getDiagnosticProblems, submitDiagnostic } from './handler';
import { getOnboardingStatus, selfDeclare, submitConfidence } from './survey-handler';

const router = Router();

router.post('/consent',     requireAuth, asyncHandler(acceptConsent));
router.post('/declaration', requireAuth, asyncHandler(declaration));
router.post('/self-declare', requireAuth, asyncHandler(selfDeclare));
router.post('/confidence',   requireAuth, asyncHandler(submitConfidence));
router.get('/status',        requireAuth, asyncHandler(getOnboardingStatus));
router.get('/problems',     requireAuth, asyncHandler(getDiagnosticProblems));
router.post('/diagnostic',  requireAuth, asyncHandler(submitDiagnostic));

export default router;
