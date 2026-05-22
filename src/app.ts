import express, {
    type Application,
    type Request,
    type Response,
} from 'express';
import { authRoute } from './modules/auth/auth.routes';
import { issueRoute } from './modules/issues/issues.routes';
import fs from 'fs';
import logger from './middleware/logger';

const app: Application = express();

app.use(express.json());
app.use(logger);

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome Our DevPulse  Site ...!');
});

app.use('/api/auth', authRoute);
app.use('/api/issues', issueRoute);

export default app;
