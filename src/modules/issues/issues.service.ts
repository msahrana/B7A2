import { pool } from '../../db';

const createIssueIntoDB = async (payload: any) => {
    const { title, description, type, reporter_id } = payload;

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
            INSERT INTO issues (title, description, type, reporter_id) VALUES($1, $2, $3, $4) RETURNING *
            `,
        [title, description, type, reporter_id],
    );
    return result.rows[0];
};

const getAllIssuesIntoDB = async () => {
    // 1. get issues
    const issuesResult = await pool.query(`
        SELECT * FROM issues ORDER BY created_at DESC
    `);

    const issues = issuesResult.rows;

    if (issues.length === 0) return [];

    // 2. extract reporter ids
    const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];

    // 3. get users
    const usersResult = await pool.query(
        `
        SELECT id, name, role
        FROM users
        WHERE id = ANY($1)
        `,
        [reporterIds],
    );

    const users = usersResult.rows;

    // 4. map users
    const userMap = new Map();
    users.forEach((u) => userMap.set(u.id, u));

    // 5. attach reporter
    return issues.map((issue) => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: userMap.get(issue.reporter_id) || null,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
    }));
};

const getSingleIssueFromDB = async (id: string) => {
    // 1. get issues
    const issuesResult = await pool.query(
        `
        SELECT * FROM issues WHERE id = $1
    `,
        [id],
    );

    if (issuesResult.rows.length === 0) {
        throw new Error('Issue not found');
    }
    const issues = issuesResult.rows[0];

    // 3. get users
    const usersResult = await pool.query(
        `
        SELECT id, name, role
        FROM users
        WHERE id = ($1)
        `,
        [issues.reporter_id],
    );

    // 5. attach reporter
    return {
        id: issues.id,
        title: issues.title,
        description: issues.description,
        type: issues.type,
        status: issues.status,
        reporter: usersResult.rows[0] || null,
        created_at: issues.created_at,
        updated_at: issues.updated_at,
    };
};

export const issueService = {
    createIssueIntoDB,
    getAllIssuesIntoDB,
    getSingleIssueFromDB,
};
