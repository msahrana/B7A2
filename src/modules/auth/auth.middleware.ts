// import type { NextFunction, Request, Response } from 'express';
// import config from '../../config';
// import jwt from 'jsonwebtoken';

// const auth = () => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         try {
//             const authHeader = req.headers.authorization;

//             if (!authHeader) {
//                 throw new Error('Unauthorized Access!');
//             }

//             // Bearer TOKEN
//             const token = authHeader.startsWith('Bearer ')
//                 ? authHeader.split(' ')[1]
//                 : authHeader;

//             if (!token) {
//                 throw new Error('Token not found!');
//             }

//             const decoded = jwt.verify(token, config.secret as string);

//             req.user = decoded as any;

//             next();
//         } catch (error: any) {
//             next(error);
//         }
//     };
// };

// export default auth;
