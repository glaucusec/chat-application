const express = require('express');

const router = express.Router();

const userController = require('../controllers/user');

router.get('/signup', userController.getSignUpPage);

router.post('/signup', userController.postSignUpForm);

router.get('/login', userController.getLoginPage);

router.post('/login', userController.postLoginData);

module.exports = router;
