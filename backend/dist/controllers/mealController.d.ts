import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
export declare const createMealSession: (req: AuthenticatedRequest, res: any) => Promise<any>;
export declare const getAllMeals: (req: any, res: any) => Promise<void>;
export declare const getMealById: (req: any, res: any) => Promise<any>;
export declare const getMyHostedMeals: (req: AuthenticatedRequest, res: any) => Promise<any>;
export declare const getMyJoinedMeals: (req: AuthenticatedRequest, res: any) => Promise<any>;
export declare const joinMealSession: (req: AuthenticatedRequest, res: any) => Promise<any>;
export declare const leaveMealSession: (req: AuthenticatedRequest, res: any) => Promise<any>;
export declare const closeMealSession: (req: AuthenticatedRequest, res: any) => Promise<any>;
//# sourceMappingURL=mealController.d.ts.map