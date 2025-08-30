import { Request, Response } from "express";
import SessionModel from "../models/session";
import { createAccount, loginUser, refreshUserAccessToken } from "@/services/auth";
import { setAuthCookies, clearAuthCookies, getAccessTokenCookieOptions } from "@/utils.ts/cookies";
import { verifyToken } from "@/utils.ts/jwt";

export const registerHandler = async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await createAccount({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });
  setAuthCookies({ res, accessToken, refreshToken })
    .status(201) // CREATED
    .json(user);
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken } = await loginUser({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });
    setAuthCookies({ res, accessToken, refreshToken })
      .status(200) // OK
      .json({ message: "Login successful" });
  } catch (err: any) {
    res.status(401).json({ message: err.message }); // UNAUTHORIZED
  }
};

export const logoutHandler = async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken;
  const decoded = verifyToken(accessToken || "");

  if (decoded?.sessionId) {
    await SessionModel.findByIdAndDelete(decoded.sessionId);
  }

  clearAuthCookies(res).status(200).json({ message: "Logout successful" });
};

export const refreshHandler = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ message: "Missing refresh token" });
  }

  try {
    const { accessToken } = await refreshUserAccessToken(refreshToken);
    res
      .status(200)
      .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
      .json({ message: "Access token refreshed" });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};
