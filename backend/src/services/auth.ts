import bcrypt from "bcrypt";
import UserModel from "@/models/user";
import SessionModel from "@/models/session";
import { signToken, verifyToken } from "@/utils.ts/jwt";

export const createAccount = async ({
  email,
  password,
  userAgent,
}: {
  email: string;
  password: string;
  userAgent?: string;
}) => {
  const hashed = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ email, password: hashed });

  const session = await SessionModel.create({ userId: user._id, userAgent });

  const accessToken = signToken({ userId: user._id, sessionId: session._id }, "15m");
  const refreshToken = signToken({ sessionId: session._id }, "7d");

  return { user, accessToken, refreshToken };
};

export const loginUser = async ({
  email,
  password,
  userAgent,
}: {
  email: string;
  password: string;
  userAgent?: string;
}) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

  const session = await SessionModel.create({ userId: user._id, userAgent });
  const accessToken = signToken({ userId: user._id, sessionId: session._id }, "15m");
  const refreshToken = signToken({ sessionId: session._id }, "7d");

  return { accessToken, refreshToken };
};

export const refreshUserAccessToken = async (refreshToken: string) => {
  const decoded = verifyToken(refreshToken);
  if (!decoded) {
    throw new Error("Invalid refresh token");
  }

  const accessToken = signToken({ sessionId: decoded.sessionId }, "15m");
  return { accessToken };
};
