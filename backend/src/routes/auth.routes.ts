import express from 'express';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { AuthController } from '../modules/auth/auth.controller';
import { createUserSchema, requestOTPSchema, verifyOTPSchema } from '../modules/auth/auth.validation';

const router = express.Router();

router.post('/otp/request', validateRequest(requestOTPSchema), AuthController.requestOTP);
router.post('/otp/verify', validateRequest(verifyOTPSchema), AuthController.verifyOTP);
router.post('/register', validateRequest(createUserSchema), AuthController.register);

router.post('/refresh', AuthController.refresh);
router.get('/profile', authenticate, AuthController.getProfile);
router.post('/logout', authenticate, AuthController.logout);

export default router;
