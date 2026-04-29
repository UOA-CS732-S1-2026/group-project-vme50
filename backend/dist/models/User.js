import mongoose, { Document } from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: "",
        trim: true,
        maxlength: 240,
    },
    favoriteCuisine: {
        type: String,
        default: "",
        trim: true,
        maxlength: 80,
    },
    yearOfStudy: {
        type: String,
        default: "",
        trim: true,
        maxlength: 40,
    },
    avatarColor: {
        type: String,
        default: "#2e7d61",
        trim: true,
    },
}, { timestamps: true });
export default mongoose.model("User", userSchema);
//# sourceMappingURL=User.js.map