import { Router } from 'express';
import { requireAuth } from '../auth/middleware';
import { acceptConsent, declaration, getDiagnosticProblems, submitDiagnostic } from './handler';
import { getOnboardingStatus, selfDeclare, submitConfidence } from './survey-handler';

const router = Router();

router.post('/consent',     requireAuth, acceptConsent);
router.post('/declaration', requireAuth, declaration);
router.post('/self-declare', requireAuth, selfDeclare);
router.post('/confidence',   requireAuth, submitConfidence);
router.get('/status',        requireAuth, getOnboardingStatus);
router.get('/problems',     requireAuth, getDiagnosticProblems);
router.post('/diagnostic',  requireAuth, submitDiagnostic);

export default router;
