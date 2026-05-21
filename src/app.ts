import express, {
    type Application,
    type Request,
    type Response,
} from 'express';
import {Pool} from 'pg'

const app: Application = express();
const port = 5000;

app.use(express.json())

const pool = new Pool({
    connectionString: ''
})

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome Our DevPulse  Site ...!');
});

app.post('/api/auth/signup', (req , res)=>{})

export default app;
