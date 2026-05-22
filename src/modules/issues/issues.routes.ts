import {
    Router,
    type NextFunction,
    type Request,
    type Response,
} from 'express';
import { issueController } from './issues.controller';
import auth from '../../middleware/auth';

const router = Router();

router.post('/', issueController.createIssue);
router.get('/', auth());

export const issueRoute = router;
