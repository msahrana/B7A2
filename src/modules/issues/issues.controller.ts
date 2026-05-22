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

const getAllIssues = async (req: Request, res: Response)=>{
    try {
        const result = await issueService.getAllIssuesIntoDB()
        
        return sendResponse(res, {
            statusCode: 200,
            success: true,
            data: result,
        });
    } catch (error:any) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error,
        });
    }
}

const getSingleIssue = async (req: Request, res: Response) =>{
     const { id } = req.params;
     try {
        const result = await issueService.getSingleIssueFromDB(id as string)

        return sendResponse(res, {
            statusCode: 200,
            success: true,
            data: result,
        });
     } catch (error:any) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error,
        });
     }
}

export const issueController = {
    createIssue, getAllIssues, getSingleIssue
};
