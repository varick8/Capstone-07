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

// GET /api/auth/me - Check if user is authenticated
export const meHandler = async (req: Request, res: Response) => {
  try {
    // Extract access token from cookies
    const token = req.cookies.accessToken;
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    // Verify token using your existing verifyToken function
    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    
    // Token is valid, return user data
    // Assuming your JWT payload contains user information
    res.status(200).json({
      email: payload?.email,
      userId: payload?.userId,
      // Add other user data from JWT payload as needed
    });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};

export const refreshHandler = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Missing refresh token" });
  }

  try {
    const { accessToken } = await refreshUserAccessToken(refreshToken);
    return res
      .status(200)
      .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
      .json({ message: "Access token refreshed" });
  } catch (err: any) {
    return res.status(401).json({ message: err.message });
  }
};
