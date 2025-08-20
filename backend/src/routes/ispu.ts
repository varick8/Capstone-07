import { Router } from "express";
import { getIspu, createIspu, getLatestIspuPerType } from "@/controllers/ispu";

const ispuRouter = Router();

ispuRouter.get("/", getIspu);
ispuRouter.get("/lastest", getLatestIspuPerType);
ispuRouter.post("/", createIspu);

export default ispuRouter;