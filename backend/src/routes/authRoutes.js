const express = require('express');
const { validateRequest } = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signupValidators, validateRequest, authController.signup);
router.post('/login', authController.loginValidators, validateRequest, authController.login);
router.post('/admin/login', authController.loginValidators, validateRequest, authController.adminLogin);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);
router.post('/forgotpassword', authController.loginValidators.slice(0, 1), validateRequest, authController.forgotPassword);
router.put('/resetpassword/:token', authController.resetValidators, validateRequest, authController.resetPassword);

module.exports = router;
