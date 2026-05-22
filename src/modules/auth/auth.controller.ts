import type { Request, Response } from 'express';
import { authService } from './auth.service';
import sendResponse from '../../utils/sendResponse';

const registerUser = async (req: Request, res: Response) => {
    try {
        const result = await authService.registerUserIntoDB(req.body);

        return sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'User registered successfully',
            data: result.rows[0],
        });
    } catch (error: any) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error,
        });
    }
};

const getAllUser = async (req: Request, res: Response) => {
    // console.log("Controller", req.user);
    try {
        const result = await authService.getAllUsersFromDB();

        return sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'All Users received successfully',
            data: result.rows,
        });
    } catch (error: any) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error,
        });
    }
};

const loginUser = async (req: Request, res: Response) => {
    try {
        const result = await authService.loginUserIntoDB(req.body);

        return sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Login successful',
            data: result,
        });
    } catch (error: any) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error,
        });
    }
};

export const authController = {
    registerUser,
    loginUser,
    getAllUser,
};
