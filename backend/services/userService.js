const { User } = require("../models/User");
const { Activity } = require("../models/Activity");
const { hashPassword, verifyPassword } = require("../utils/password");

const UserService = {
  async syncUser({ userId, email, name, password }) {
    const baseData = {
      userId,
      email: email || "",
      name: name || ""
    };

    const operationData = {
      ...baseData,
      ...(password && { password: await hashPassword(password) })
    };

    return User.findOneAndUpdate(
      { userId },
      operationData,
      { new: true, upsert: true }
    );
  },

  async createUser({ email, name, password }) {
    const hashedPassword = await hashPassword(password);

    return User.create({
      userId: email, // using email as unique userId
      email,
      name,
      password: hashedPassword
    });
  },

  async getUser(userId) {
    return User.findOne({ userId }).populate("activities"); 
  },

  async updateUser(userId, data) {
    const updateData = {};

    if (data.email) updateData.email = data.email;
    if (data.name) updateData.name = data.name;
    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    return User.findOneAndUpdate(
      { userId },
      updateData,
      { new: true }
    );
  },

  async deleteUser(userId) {
    const user = await User.findOne({ userId });
    if (user) {
      await Activity.deleteMany({ userId: user._id });
      await User.deleteOne({ userId });
    }
  },

  async verifyCredentials(email, password) {
    const user = await User.findOne({ email });
    if (!user || !user.password) return null;

    const isValid = await verifyPassword(password, user.password);
    return isValid ? user : null;
  }
};

module.exports = { UserService };
