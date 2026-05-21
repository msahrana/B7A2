import bcrypt from 'bcrypt';
import { pool } from '../../db';

const registerUserIntoDB = async (payload: any) => {
    const { name, email, password, role } = payload;
    const hashPassword = await bcrypt.hash(password, 8);

    const result = await pool.query(
        `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, COALESCE($4,'contributor'))
        RETURNING *
        `,
        [name, email, hashPassword, role],
    );
    delete result.rows[0].password;
    return result;
};

export const authService = {
    registerUserIntoDB,
};
