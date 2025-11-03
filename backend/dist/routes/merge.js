"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const merge_1 = require("../controllers/merge");
const mergeRouter = (0, express_1.Router)();
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
mergeRouter.get("/detail/:type", asyncHandler(merge_1.getSensorDetailByType));
mergeRouter.get("/home", asyncHandler(merge_1.getSensorDetail));
exports.default = mergeRouter;
