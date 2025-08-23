const { UserService } = require("../services/userService");

const UserController = {
  // Sync Clerk user data
  syncUser: async (req, res) => {
    try {
      const { userId, email, name, password } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }

      const user = await UserService.syncUser({ userId, email, name, password });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new user with password
  createUser: async (req, res) => {
    try {
      const userData = req.body;
      const user = await UserService.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user
  getUser: async (req, res) => {
    try {
      const user = await UserService.getUser(req.params.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const user = await UserService.updateUser(req.params.userId, req.body);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      await UserService.deleteUser(req.params.userId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Login with email/password
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await UserService.verifyCredentials(email, password);

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({
        id: user.id,
        userId: user.userId,
        name: user.name,
        email: user.email,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = { UserController };
