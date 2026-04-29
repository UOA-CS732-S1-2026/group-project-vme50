import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    description: string;
    title: string;
    location: string;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    description: string;
    title: string;
    location: string;
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
    location: string;
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
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    description: string;
    title: string;
    location: string;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    description: string;
    title: string;
    location: string;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    description: string;
    title: string;
    location: string;
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
}, unknown, {
    description: string;
    title: string;
    location: string;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    description: string;
    title: string;
    location: string;
    time: NativeDate;
    slots: number;
    creator: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isActive: boolean;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export default _default;
//# sourceMappingURL=MealSession.d.ts.map