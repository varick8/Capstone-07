"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const authRouter = (0, express_1.Router)();
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
authRouter.post("/register", asyncHandler(auth_1.registerHandler));
authRouter.post("/login", asyncHandler(auth_1.loginHandler));
authRouter.post("/logout", asyncHandler(auth_1.logoutHandler));
authRouter.post("/refresh", asyncHandler(auth_1.refreshHandler));
authRouter.get("/me", asyncHandler(auth_1.meHandler));
exports.default = authRouter;
