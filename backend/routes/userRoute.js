const express = require('express');
const { UserController } = require('../controllers/userController');

const router = express.Router();

// Clerk sync endpoint
router.post('/sync', UserController.syncUser);

// Authentication
router.post('/register', UserController.createUser);
router.post('/login', UserController.login);

// Standard CRUD endpoints
router.get('/:userId', UserController.getUser);
router.put('/:userId', UserController.updateUser);
router.delete('/:userId', UserController.deleteUser);

module.exports = router;
