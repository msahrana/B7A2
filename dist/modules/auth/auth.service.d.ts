import type { IUser } from './auth.interface';
export declare const authService: {
    registerUserIntoDB: (payload: IUser) => Promise<import("pg").QueryResult<any>>;
    loginUserIntoDB: (payload: {
        email: string;
        password: string;
    }) => Promise<{
        token: string;
        user: any;
    }>;
    getAllUsersFromDB: () => Promise<import("pg").QueryResult<any>>;
};
//# sourceMappingURL=auth.service.d.ts.map