import mongoose from "mongoose";
export declare const mealRepository: {
    createMeal(data: any): Promise<mongoose.Document<unknown, {}, {
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
    findActiveMeals(): Promise<{
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
    findMealById(mealId: string): Promise<(mongoose.Document<unknown, {}, {
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
    }) | null>;
    findMealDetailsById(mealId: string): Promise<({
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
    }>) | null>;
    findMealByUser(userId: string): Promise<(mongoose.Document<unknown, {}, {
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
    }) | null>;
    findMealsByCreator(userId: string): Promise<({
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
    findMealsJoinedByUser(userId: string): Promise<({
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
    deleteMeal(id: string): Promise<(mongoose.Document<unknown, {}, {
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
    }) | null>;
    saveMeal(session: any): Promise<any>;
};
//# sourceMappingURL=mealRepository.d.ts.map