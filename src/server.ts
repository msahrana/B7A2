import express, {
    type Application,
    type Request,
    type Response,
} from 'express';

const app: Application = express();
const port = 5000;

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome Our DevPulse  Site ...!');
});

app.post('/api/auth/signup', (req , res)=>{})

app.listen(port, () => {
    console.log(`Express app listening on port ${port}`);
});
