"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshHandler = exports.meHandler = exports.logoutHandler = exports.loginHandler = exports.registerHandler = void 0;
const session_1 = __importDefault(require("../models/session"));
const auth_1 = require("../services/auth");
const cookies_1 = require("../utils/cookies");
const jwt_1 = require("../utils/jwt");
const registerHandler = async (req, res) => {
    const { user, accessToken, refreshToken } = await (0, auth_1.createAccount)({
        ...req.body,
        userAgent: req.headers["user-agent"],
    });
    (0, cookies_1.setAuthCookies)({ res, accessToken, refreshToken })
        .status(201)
        .json(user);
};
exports.registerHandler = registerHandler;
const loginHandler = async (req, res) => {
    try {
        const { accessToken, refreshToken } = await (0, auth_1.loginUser)({
            ...req.body,
            userAgent: req.headers["user-agent"],
        });
        (0, cookies_1.setAuthCookies)({ res, accessToken, refreshToken })
            .status(200)
            .json({ message: "Login successful" });
    }
    catch (err) {
        res.status(401).json({ message: err.message });
    }
};
exports.loginHandler = loginHandler;
const logoutHandler = async (req, res) => {
    const accessToken = req.cookies.accessToken;
    const decoded = (0, jwt_1.verifyToken)(accessToken || "");
    if (decoded?.sessionId) {
        await session_1.default.findByIdAndDelete(decoded.sessionId);
    }
    (0, cookies_1.clearAuthCookies)(res).status(200).json({ message: "Logout successful" });
};
exports.logoutHandler = logoutHandler;
const meHandler = async (req, res) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const payload = (0, jwt_1.verifyToken)(token);
        if (!payload) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        res.status(200).json({
            email: payload?.email,
            userId: payload?.userId,
        });
    }
    catch (err) {
        res.status(401).json({ message: err.message });
    }
};
exports.meHandler = meHandler;
const refreshHandler = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: "Missing refresh token" });
    }
    try {
        const { accessToken } = await (0, auth_1.refreshUserAccessToken)(refreshToken);
        return res
            .status(200)
            .cookie("accessToken", accessToken, (0, cookies_1.getAccessTokenCookieOptions)())
            .json({ message: "Access token refreshed" });
    }
    catch (err) {
        return res.status(401).json({ message: err.message });
    }
};
exports.refreshHandler = refreshHandler;
