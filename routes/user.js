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

router.post('/messages', auth.authenticate, chatController.fetchAllMessages);

router.post('/creategroup', auth.authenticate, chatController.createNewGroup)

router.post('/groups', auth.authenticate, chatController.fetchGroups);

router.post('/addmessage', auth.authenticate, chatController.createNewMessage);

router.post('/addusertogroup', auth.authenticate, chatController.addUserToGroup);

router.post('/group-members', auth.authenticate, chatController.fetchGroupMembers);

router.post('/isAdmin', auth.authenticate, chatController.isAdminOrNot);

router.post('/makeGroupAdmin', auth.authenticate, chatController.makeGroupAdmin)

router.post('/removeUserFromGroup', auth.authenticate, chatController.removeUserFromGroup);

module.exports = router;
