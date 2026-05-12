export declare const registerUser: (data: {
    name: string;
    email: string;
    password: string;
}) => Promise<{
    success: boolean;
    message: string;
    data: {
        token: string;
        user: {
            id: any;
            name: any;
            email: any;
        };
    };
}>;
export declare const loginUser: (data: {
    email: string;
    password: string;
}) => Promise<{
    success: boolean;
    message: string;
    data: {
        token: string;
        user: {
            id: any;
            name: any;
            email: any;
        };
    };
}>;
export declare const logoutUser: (token: string) => Promise<{
    success: boolean;
    message: string;
}>;
//# sourceMappingURL=authService.d.ts.map