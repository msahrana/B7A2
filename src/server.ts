import app from './app';
import config from './config';
import { initDB } from './db';

const main = () => {
    initDB();

    app.listen(config.port, () => {
        console.log(`Express app listening on port ${config.port}`);
    });
};

main();
