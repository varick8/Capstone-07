"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookies = exports.setAuthCookies = exports.getRefreshTokenCookieOptions = exports.getAccessTokenCookieOptions = void 0;
const baseOptions = {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
};
const getAccessTokenCookieOptions = () => ({
    ...baseOptions,
    maxAge: 1000 * 60 * 15,
});
exports.getAccessTokenCookieOptions = getAccessTokenCookieOptions;
const getRefreshTokenCookieOptions = () => ({
    ...baseOptions,
    maxAge: 1000 * 60 * 60 * 24 * 7,
});
exports.getRefreshTokenCookieOptions = getRefreshTokenCookieOptions;
const setAuthCookies = ({ res, accessToken, refreshToken, }) => res
    .cookie("accessToken", accessToken, (0, exports.getAccessTokenCookieOptions)())
    .cookie("refreshToken", refreshToken, (0, exports.getRefreshTokenCookieOptions)());
exports.setAuthCookies = setAuthCookies;
const clearAuthCookies = (res) => res.clearCookie("accessToken").clearCookie("refreshToken");
exports.clearAuthCookies = clearAuthCookies;
