import { Router } from "express";
import { registerHandler, loginHandler, logoutHandler, refreshHandler, meHandler } from "@/controllers/auth";

const authRouter = Router();

// Async wrapper to handle errors properly
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

authRouter.post("/register", asyncHandler(registerHandler));
authRouter.post("/login", asyncHandler(loginHandler));
authRouter.post("/logout", asyncHandler(logoutHandler));
authRouter.post("/refresh", asyncHandler(refreshHandler));
authRouter.get("/me", asyncHandler(meHandler));

export default authRouter;