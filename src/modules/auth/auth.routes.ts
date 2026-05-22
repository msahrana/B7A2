import { Router } from 'express';
import { authController } from './auth.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../../types';

const router = Router();

router.post('/signup', authController.registerUser);
router.post('/login', authController.loginUser);
router.get(
    '/',
    auth(USER_ROLE.contributor, USER_ROLE.maintainer),
    authController.getAllUser,
);

export const authRoute = router;
