import mongoose from "mongoose";
export declare const createMeal: (data: any, userId: string) => Promise<mongoose.Document<unknown, {}, {
    description: string;
    title: string;
    location: any;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    description: string;
    title: string;
    location: any;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}>;
export declare const getMeals: () => Promise<{
    participants: any[];
    description: string;
    title: string;
    location: any;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    isActive: boolean;
    createdAt: NativeDate;
    updatedAt: NativeDate;
    _id: mongoose.Types.ObjectId;
    __v: number;
}[]>;
export declare const joinMeal: (mealId: string, userId: string) => Promise<mongoose.Document<unknown, {}, {
    description: string;
    title: string;
    location: any;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    description: string;
    title: string;
    location: any;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}>;
export declare const leaveMeal: (mealId: string, userId: string) => Promise<mongoose.Document<unknown, {}, {
    description: string;
    title: string;
    location: any;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    description: string;
    title: string;
    location: any;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}>;
//# sourceMappingURL=mealService.d.ts.map