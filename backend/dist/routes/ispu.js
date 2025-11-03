"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ispu_1 = require("../controllers/ispu");
const ispuRouter = (0, express_1.Router)();
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
ispuRouter.get("/", asyncHandler(ispu_1.getIspu));
ispuRouter.get("/lastest", asyncHandler(ispu_1.getLatestIspu));
exports.default = ispuRouter;
