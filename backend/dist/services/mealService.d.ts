import mongoose from "mongoose";
export declare const createMeal: (data: any, userId: string) => Promise<mongoose.Document<unknown, {}, {
    description: string;
    title: string;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
    location?: {
        address: string;
        lat: number;
        lng: number;
    } | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    description: string;
    title: string;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
    location?: {
        address: string;
        lat: number;
        lng: number;
    } | null;
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
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    isActive: boolean;
    location?: {
        address: string;
        lat: number;
        lng: number;
    } | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
    _id: mongoose.Types.ObjectId;
    __v: number;
}[]>;
export declare const getMealById: (mealId: string) => Promise<{
    description: string;
    title: string;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
    location?: {
        address: string;
        lat: number;
        lng: number;
    } | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & Required<{
    _id: mongoose.Types.ObjectId;
}>>;
export declare const joinMeal: (mealId: string, userId: string) => Promise<mongoose.Document<unknown, {}, {
    description: string;
    title: string;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
    location?: {
        address: string;
        lat: number;
        lng: number;
    } | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    description: string;
    title: string;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
    location?: {
        address: string;
        lat: number;
        lng: number;
    } | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}>;
export declare const closeMeal: (mealId: string, userId: string) => Promise<mongoose.Document<unknown, {}, {
    description: string;
    title: string;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
    location?: {
        address: string;
        lat: number;
        lng: number;
    } | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    description: string;
    title: string;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
    location?: {
        address: string;
        lat: number;
        lng: number;
    } | null;
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
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
    location?: {
        address: string;
        lat: number;
        lng: number;
    } | null;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    description: string;
    title: string;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
    location?: {
        address: string;
        lat: number;
        lng: number;
    } | null;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}>;
export declare const getHostingMeals: (userId: string) => Promise<({
    description: string;
    title: string;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
    location?: {
        address: string;
        lat: number;
        lng: number;
    } | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & Required<{
    _id: mongoose.Types.ObjectId;
}>)[]>;
export declare const getJoinedMeals: (userId: string) => Promise<({
    description: string;
    title: string;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
    location?: {
        address: string;
        lat: number;
        lng: number;
    } | null;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
} & Required<{
    _id: mongoose.Types.ObjectId;
}>)[]>;
//# sourceMappingURL=mealService.d.ts.map