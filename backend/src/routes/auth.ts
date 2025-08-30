import { Router } from "express";
import { registerHandler, loginHandler, logoutHandler, refreshHandler } from "@/controllers/auth";

const authRouter = Router();

authRouter.post("/register", registerHandler);
authRouter.post("/login", loginHandler);
authRouter.post("/logout", logoutHandler);
authRouter.post("/refresh", refreshHandler);

export default authRouter;