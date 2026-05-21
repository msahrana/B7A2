import { pool } from '../../db';

const createIssueIntoDB = async (payload: any) => {
    const { title, description, type, status, reporter_id } = payload;

    // First check if the user is exists
    const user = await pool.query(
        `
        SELECT * FROM users WHERE id=$1
        `,
        [reporter_id],
    );

    if (user.rows.length === 0) {
        throw new Error('User not exists!');
    }

    const result = await pool.query(
        `
            INSERT INTO issues (title, description, type, status, reporter_id) VALUES($1, $2, $3, $4, $5) RETURNING *
            `,
        [title, description, type, status, reporter_id],
    );
    return result;
};

export const issueService = {
    createIssueIntoDB,
};
