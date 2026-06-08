const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

const { authenticate } = require('../middleware/auth');

router.post('/register', (req, res) => AuthController.register(req, res));
router.post('/login', (req, res) => AuthController.login(req, res));
router.get('/me', authenticate, (req, res) => AuthController.me(req, res));

module.exports = router;
