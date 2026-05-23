import sendResponse from '../utils/sendResponse';
import jwt, {} from 'jsonwebtoken';
import config from '../config';
import { pool } from '../db';
const auth = (...roles) => {
    return async (req, res, next) => {
        // console.log(roles);
        try {
            const jwt_token = req.headers.authorization;
            if (!jwt_token) {
                return sendResponse(res, {
                    statusCode: 401,
                    success: false,
                    message: 'Unauthorized access !!!',
                });
            }
            const decoded = jwt.verify(jwt_token, config.secret);
            const userData = await pool.query(`
            SELECT * FROM users WHERE email=$1
            `, [decoded.email]);
            const user = userData.rows[0];
            if (userData.rows.length === 0) {
                return sendResponse(res, {
                    statusCode: 404,
                    success: false,
                    message: 'User not found in database !',
                });
            }
            if (roles.length && !roles.includes(user.role)) {
                return sendResponse(res, {
                    statusCode: 403,
                    success: false,
                    message: 'Forbidden!!; This role have no access !',
                });
            }
            req.user = decoded;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
export default auth;
//# sourceMappingURL=auth.js.map