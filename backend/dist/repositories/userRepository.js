import User from "../models/User.js";
export const userRepository = {
    async findByEmail(email) {
        return await User.findOne({ email });
    },
    async createUser(data) {
        return await User.create(data);
    },
};
//# sourceMappingURL=userRepository.js.map