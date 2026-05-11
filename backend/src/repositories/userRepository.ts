import User from "../models/User.js";

export const userRepository = {
  async findByEmail(email: string) {
    return await User.findOne({ email });
  },

  async findById(id: string) {
    return await User.findById(id);
  },

  async createUser(data: { name: string; email: string; password: string }) {
    return await User.create(data);
  },

  async updateUser(
    id: string,
    data: {
      name?: string;
      bio?: string;
      favoriteCuisine?: string;
      yearOfStudy?: string;
      avatarColor?: string;
    },
  ) {
    return await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },
};
