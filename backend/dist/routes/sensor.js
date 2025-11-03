"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sensor_1 = require("../controllers/sensor");
const sensorRouter = (0, express_1.Router)();
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
sensorRouter.get("/", asyncHandler(sensor_1.getSensors));
sensorRouter.get("/lastest", asyncHandler(sensor_1.getLatestSensor));
exports.default = sensorRouter;
