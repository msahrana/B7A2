import express, {} from 'express';
import { authRoute } from './modules/auth/auth.routes';
import { issueRoute } from './modules/issues/issues.routes';
import fs from 'fs';
import logger from './middleware/logger';
const app = express();
app.use(express.json());
app.use(logger);
app.get('/', (req, res) => {
    res.send(`<h1 style="
            color: black;
            background-color: cyan;
            font-size: 45px;
            text-align: center;
            padding: 20px;
        ">
            Welcome Our 
            <span style="color: yellow;">Dev</span><span style="color: red;">Pulse</span>
            Site ...!
        </h1>`);
});
app.use('/api/auth', authRoute);
app.use('/api/issues', issueRoute);
export default app;
//# sourceMappingURL=app.js.map