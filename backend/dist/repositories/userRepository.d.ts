export declare const userRepository: {
    findByEmail(email: string): Promise<(import("mongoose").Document<unknown, {}, import("../models/User.js").IUser, {}, import("mongoose").DefaultSchemaOptions> & import("../models/User.js").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    createUser(data: {
        name: string;
        email: string;
        password: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("../models/User.js").IUser, {}, import("mongoose").DefaultSchemaOptions> & import("../models/User.js").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
};
//# sourceMappingURL=userRepository.d.ts.map