import express from "express";
import jwt from "jsonwebtoken";
type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;
export interface JwtUserPayload extends jwt.JwtPayload {
    userId: string;
}
interface AuthRequest extends Request {
    user?: JwtUserPayload;
}
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Response | undefined;
export type AuthenticatedRequest = AuthRequest;
export {};
//# sourceMappingURL=authMiddleware.d.ts.map