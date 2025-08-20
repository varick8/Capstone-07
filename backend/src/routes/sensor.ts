import { Router } from "express";
import { getSensors, createSensor, getLatestSensor } from "../controllers/sensor";

const sensorRouter = Router();

sensorRouter.get("/", getSensors);
sensorRouter.get("/lastest", getLatestSensor);
sensorRouter.post("/", createSensor);

export default sensorRouter;