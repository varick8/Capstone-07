import { Router } from "express";
import { getSensors, createSensor, getLatestSensor } from "../controllers/sensor";

const sensorRouter = Router();

// Async wrapper to handle errors properly
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

sensorRouter.get("/", asyncHandler(getSensors));
sensorRouter.get("/lastest", asyncHandler(getLatestSensor));
sensorRouter.post("/", asyncHandler(createSensor));

export default sensorRouter;