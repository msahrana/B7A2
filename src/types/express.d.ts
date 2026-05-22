import type { JwtPayload } from 'jsonwebtoken';
import type { RUser } from './index';

// declare global {
//     namespace Express {
//         interface Request {
//             user?: RUser & {
//                 id: string;
//             };
//             cookies?: Record<string, string>;
//         }
//     }
// }

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export {};
