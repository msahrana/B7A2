import sendResponse from '../../utils/sendResponse';
import { issueService } from './issues.service';
const createIssue = async (req, res) => {
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
    }
    catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error,
        });
    }
};
const getAllIssues = async (req, res) => {
    try {
        const result = await issueService.getAllIssuesIntoDB();
        return sendResponse(res, {
            statusCode: 200,
            success: true,
            data: result,
        });
    }
    catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error,
        });
    }
};
const getSingleIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await issueService.getSingleIssueFromDB(id);
        return sendResponse(res, {
            statusCode: 200,
            success: true,
            data: result,
        });
    }
    catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error,
        });
    }
};
const updateIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user) {
            throw new Error('Unauthorized');
        }
        const issue = await issueService.getIssueById(id);
        if (!issue) {
            throw new Error('Issue not found');
        }
        if (user.role === 'contributor') {
            if (issue.reporter_id !== user.id) {
                throw new Error('You can only update your own issues');
            }
            if (issue.status !== 'open') {
                throw new Error('You can only update open issues');
            }
        }
        const result = await issueService.updateSingleIssueFromDB(req.body, id);
        return sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Issue updated successfully',
            data: result.rows[0],
        });
    }
    catch (error) {
        return sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error,
        });
    }
};
const deleteIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user) {
            throw new Error('Unauthorized');
        }
        if (user.role !== 'maintainer') {
            return sendResponse(res, {
                statusCode: 403,
                success: false,
                message: 'Only maintainer can delete issues',
            });
        }
        const deletedIssue = await issueService.deleteIssueIntoDB(id);
        if (!deletedIssue) {
            return sendResponse(res, {
                statusCode: 404,
                success: false,
                message: 'Issue not found',
            });
        }
        return sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Issue deleted successfully',
        });
    }
    catch (error) {
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
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue,
};
//# sourceMappingURL=issues.controller.js.map