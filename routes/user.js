const express = require('express');

const Message = require('../models/message');

const userController = require('../controllers/user');
const chatController = require('../controllers/chat');
const auth = require('../middleware/auth');

module.exports = (io) => {

    const router = express.Router();

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

    io.on('connection', (socket) => {

        socket.on('join-group', (groupId) => {
            socket.join(groupId)
        })
        socket.on('chat-message', async (msg, groupId) => {
            io.to(groupId).emit('chat-message', msg);
            if(msg) {
                try {
                    await Message.create({ message: msg, groupId: groupId })
                } catch(err) {
                    console.log('error @ createNewMessage', err);
                }
            }
        })
    })

    return router;
}


