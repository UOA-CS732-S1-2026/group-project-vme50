import mongoose from "mongoose";
const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        index: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: 0,
    },
}, {
    timestamps: true,
});
export default mongoose.model("Blacklist", blacklistSchema);
//# sourceMappingURL=Blacklist.js.map