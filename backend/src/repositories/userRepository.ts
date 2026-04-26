import User from "../models/User.js";

export const userRepository = {
  async findByEmail(email: string) {
    return await User.findOne({ email });
  },

  async createUser(data: { name: string; email: string; password: string }) {
    return await User.create(data);
  },
};
