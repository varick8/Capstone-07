import { Router } from "express";
import { getSensorDetail, getSensorDetailByType } from "@/controllers/merge";

const mergeRouter = Router();

// Async wrapper to handle errors properly
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

mergeRouter.get("/detail/:type", asyncHandler(getSensorDetailByType));
mergeRouter.get("/home", asyncHandler(getSensorDetail));

export default mergeRouter;