import { Router } from "express";
import { issueController } from "./issues.controller";

const router = Router()

router.post('/', issueController.createIssue)

export const issueRoute = router;