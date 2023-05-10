const express = require('express');

const router = express.Router();

const userController = require('../controllers/user');
const chatController = require('../controllers/chat');
const auth = require('../middleware/auth');

router.get('/signup', userController.getSignUpPage);

router.post('/signup', userController.postSignUpForm);

router.get('/login', userController.getLoginPage);

router.post('/login', userController.postLoginData);

router.get('/chat', auth.authenticate ,chatController.getChatApp);

router.post('/chat', auth.authenticate, chatController.postMessage)

module.exports = router;
