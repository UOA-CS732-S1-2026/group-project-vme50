import User from "../models/User.js";
export const userRepository = {
    async findByEmail(email) {
        return await User.findOne({ email });
    },
    async findById(id) {
        return await User.findById(id);
    },
    async createUser(data) {
        return await User.create(data);
    },
    async updateUser(id, data) {
        return await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    },
};
//# sourceMappingURL=userRepository.js.map