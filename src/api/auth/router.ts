import { Router } from 'express';
import { asyncHandler } from '../asyncHandler';
import { register } from './register';
import { login } from './login';
import { logout } from './logout';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/logout', logout);

export default router;
