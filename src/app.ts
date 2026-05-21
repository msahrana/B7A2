import express, {
    type Application,
    type Request,
    type Response,
} from 'express';
import { authRoute } from './modules/auth/auth.routes';

const app: Application = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome Our DevPulse  Site ...!');
});

app.use('/api/auth', authRoute);

export default app;
