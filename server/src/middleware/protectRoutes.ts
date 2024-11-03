import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../db/prisma";
import { Request, Response, NextFunction } from "express";
interface decodedToken extends JwtPayload    {
  id: number;
}
declare global {
	namespace Express {
		export interface Request {
			user: {
				id: number;
			};
		}
	}
}
export const protectRoutes = async (req: Request, res: Response, next: NextFunction) : Promise<any> => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as decodedToken;
    console.log("decoded", decoded);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - invalid token" });
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, fullName: true, email: true, role: true },
    });
    if (!user) {
      return res.status(401).json({ message: "not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
