import { Response } from "express";

const baseOptions = {
  httpOnly: true,
  sameSite: "none" as const, // Changed from "strict" to "none" for cross-origin requests
  secure: true, // Required when sameSite is "none"
};

export const getAccessTokenCookieOptions = () => ({
  ...baseOptions,
  maxAge: 1000 * 60 * 15, // 15 minutes
});

export const getRefreshTokenCookieOptions = () => ({
  ...baseOptions,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
});

export const setAuthCookies = ({
  res,
  accessToken,
  refreshToken,
}: {
  res: Response;
  accessToken: string;
  refreshToken: string;
}) =>
  res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

export const clearAuthCookies = (res: Response) =>
  res.clearCookie("accessToken").clearCookie("refreshToken");
