import bcrypt from 'bcrypt';
import { pool } from '../../db';
import jwt from 'jsonwebtoken';
import config from '../../config';
import type { IUser } from './auth.interface';

const registerUserIntoDB = async (payload: IUser) => {
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

const getAllUsersFromDB = async () => {
    const result = await pool.query(`
            SELECT * FROM users
            `);
    delete result.rows[0].password;
    return result;
};

const loginUserIntoDB = async (payload: {
    email: string;
    password: string;
}) => {
    const { email, password } = payload;

    // 1. Check if the user exists
    const userData = await pool.query(
        `
    SELECT * FROM users WHERE email=$1
    `,
        [email],
    );

    if (userData.rows.length === 0) {
        throw new Error('Invalid Credentials!');
    }

    // 2. Compare the password -> Done
    const user = userData.rows[0];
    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
        throw new Error('Password does not match!');
    }

    // 3. Generate payload
    const jwtPayload = {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
    };

    // 4. Generate Token
    const token = jwt.sign(jwtPayload, config.secret as string, {
        expiresIn: '1d',
    });

    // const refreshToken = jwt.sign(jwtPayload, config.refresh_secret as string, {
    //     expiresIn: '30d',
    // });

    // 5. Remove password from response
    delete user.password;

    return { token, user };
};

export const authService = {
    registerUserIntoDB,
    loginUserIntoDB,
    getAllUsersFromDB,
};
