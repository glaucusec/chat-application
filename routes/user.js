const express = require('express');

const router = express.Router();

const userController = require('../controllers/user');
const chatController = require('../controllers/chat');

router.get('/signup', userController.getSignUpPage);

router.post('/signup', userController.postSignUpForm);

router.get('/login', userController.getLoginPage);

router.post('/login', userController.postLoginData);

router.get('/chat', chatController.getChatApp);

module.exports = router;
