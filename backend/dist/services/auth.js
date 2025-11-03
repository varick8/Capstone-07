"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshUserAccessToken = exports.loginUser = exports.createAccount = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../models/user"));
const session_1 = __importDefault(require("../models/session"));
const jwt_1 = require("../utils/jwt");
const createAccount = async ({ email, password, userAgent, }) => {
    const hashed = await bcrypt_1.default.hash(password, 10);
    const user = await user_1.default.create({ email, password: hashed });
    const session = await session_1.default.create({ userId: user._id, userAgent });
    const accessToken = (0, jwt_1.signToken)({
        userId: user._id,
        sessionId: session._id,
        email: user.email
    }, "15m");
    const refreshToken = (0, jwt_1.signToken)({ sessionId: session._id }, "7d");
    return { user, accessToken, refreshToken };
};
exports.createAccount = createAccount;
const loginUser = async ({ email, password, userAgent, }) => {
    const user = await user_1.default.findOne({ email });
    if (!user) {
        throw new Error("Invalid credentials");
    }
    const valid = await bcrypt_1.default.compare(password, user.password);
    if (!valid) {
        throw new Error("Invalid password");
    }
    const session = await session_1.default.create({ userId: user._id, userAgent });
    const accessToken = (0, jwt_1.signToken)({
        userId: user._id,
        sessionId: session._id,
        email: user.email
    }, "15m");
    const refreshToken = (0, jwt_1.signToken)({ sessionId: session._id }, "7d");
    return { accessToken, refreshToken };
};
exports.loginUser = loginUser;
const refreshUserAccessToken = async (refreshToken) => {
    const decoded = (0, jwt_1.verifyToken)(refreshToken);
    if (!decoded) {
        throw new Error("Invalid refresh token");
    }
    const session = await session_1.default.findById(decoded.sessionId);
    if (!session) {
        throw new Error("Session not found");
    }
    const user = await user_1.default.findById(session.userId);
    if (!user) {
        throw new Error("User not found");
    }
    const accessToken = (0, jwt_1.signToken)({
        userId: user._id,
        sessionId: decoded.sessionId,
        email: user.email
    }, "15m");
    return { accessToken };
};
exports.refreshUserAccessToken = refreshUserAccessToken;
