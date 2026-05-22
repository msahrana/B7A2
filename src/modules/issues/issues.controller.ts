import type { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { issueService } from './issues.service';

const createIssue = async (req: Request, res: Response) => {
    try {
        // check id
        const reporter_id = req.user?.id;

        // destructure 
        const payload = {
            ...req.body,
            reporter_id,
        };

        const result = await issueService.createIssueIntoDB(payload);
        
        return sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'Issue created successfully',
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

export const issueController = {
    createIssue,
};
