import mongoose from "mongoose";
export declare const mealRepository: {
    createMeal(data: any): Promise<mongoose.Document<unknown, {}, {
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
    findActiveMeals(): Promise<{
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
    findMealById(mealId: string): Promise<(mongoose.Document<unknown, {}, {
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
    }) | null>;
    findMealByUser(userId: string): Promise<(mongoose.Document<unknown, {}, {
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
    }) | null>;
    deleteMeal(id: string): Promise<(mongoose.Document<unknown, {}, {
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
    }) | null>;
    saveMeal(session: any): Promise<any>;
};
//# sourceMappingURL=mealRepository.d.ts.map