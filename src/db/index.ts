import { Pool } from 'pg';
import config from '../config';

export const pool = new Pool({
    connectionString: config.connectionString,
});

export const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS issues (
            id SERIAL PRIMARY KEY, 
            title VARCHAR(150) NOT NULL,
            description TEXT NOT NULL CHECK (LENGTH(description) >= 20),
            type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature_request')),
            status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
            reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);

        console.log('DevPulse Database connected successfully !');
    } catch (error: any) {
        console.log(error);
    }
};
