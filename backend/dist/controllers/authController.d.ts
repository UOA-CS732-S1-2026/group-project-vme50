import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
export declare const register: (req: any, res: any) => Promise<any>;
export declare const login: (req: any, res: any) => Promise<any>;
export declare const logout: (req: any, res: any) => void;
export declare const getCurrentUser: (req: AuthenticatedRequest, res: any) => Promise<any>;
export declare const updateProfile: (req: AuthenticatedRequest, res: any) => Promise<any>;
//# sourceMappingURL=authController.d.ts.map