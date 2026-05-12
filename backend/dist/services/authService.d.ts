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
            bio: any;
            favoriteCuisine: any;
            yearOfStudy: any;
            avatarColor: any;
            createdAt: any;
            updatedAt: any;
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
            bio: any;
            favoriteCuisine: any;
            yearOfStudy: any;
            avatarColor: any;
            createdAt: any;
            updatedAt: any;
        };
    };
}>;
export declare const logoutUser: (token: string) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const getCurrentUser: (userId: string) => Promise<{
    success: boolean;
    data: {
        id: any;
        name: any;
        email: any;
        bio: any;
        favoriteCuisine: any;
        yearOfStudy: any;
        avatarColor: any;
        createdAt: any;
        updatedAt: any;
    };
}>;
export declare const updateCurrentUser: (userId: string, data: {
    name?: string;
    bio?: string;
    favoriteCuisine?: string;
    yearOfStudy?: string;
    avatarColor?: string;
}) => Promise<{
    success: boolean;
    message: string;
    data: {
        id: any;
        name: any;
        email: any;
        bio: any;
        favoriteCuisine: any;
        yearOfStudy: any;
        avatarColor: any;
        createdAt: any;
        updatedAt: any;
    };
}>;
//# sourceMappingURL=authService.d.ts.map