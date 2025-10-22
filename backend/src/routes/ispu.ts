import { Router } from "express";
import { getIspu, getLatestIspu } from "@/controllers/ispu";

const ispuRouter = Router();

// Async wrapper to handle errors properly
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

ispuRouter.get("/", asyncHandler(getIspu));
ispuRouter.get("/lastest", asyncHandler(getLatestIspu));
// ispuRouter.post("/", createIspu);

export default ispuRouter;