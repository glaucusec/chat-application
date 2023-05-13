const path = require('path');
const rootDir = require('../util/path');
const Sequelize = require('sequelize');

const Message = require('../models/message');
const UserGroup = require('../models/usergroup');
const User = require('../models/user');
const Group = require('../models/group');

exports.getChatApp = (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'chat.html'));
}

exports.createNewGroup = async (req, res, next) => {
    const groupName = req.body.group_name;
    try {
        await req.user.createGroup( { name: groupName } );
        console.log(`Group created by User ${req.user.id}`)
        res.status(200).json( { groupCreated: true} )
    } catch(err) {
        console.log(err);
        res.status(500).json( { groupCreated: false })
    }
}

exports.fetchGroups = async(req, res, next) => {
    const userid = req.user.id;
    try {
        const groups = await req.user.getGroups();
        res.status(200).json(groups);
    } catch(err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.createNewMessage = async (req, res, next) => {
    const message = req.body.message;
    const groupId = req.body.group_id;
    try {
        await Message.create({ message: message, groupId: groupId })
        res.status(200).json({ messageCreated: true });
    } catch(err) {
        console.log('error @ createNewMessage', err);
        res.status(500).json({ messageCreated: false });
    }
}

exports.addUserToGroup = async(req, res, next) => {
    const groupId = req.body.groupId;
    const userId = req.body.newUserId;
    try {
        const users = await UserGroup.findAll({ attributes: ['userId'], where: {groupId: groupId}})
        const userIds = users.map(user => user.dataValues.userId)
        console.log(userIds);
        if (userIds.includes(Number(userId))) { 
            console.log('User is a Existing Member');
            return res.status(409).json( { message: 'User is an Existing Member' })
        }
        const user = await User.findByPk(userId);
        if(!user) {
            console.log('User not Found@addUserToGroup');
            return res.status(404).json({message: 'User Not Found'})
        }
        const group = await Group.findByPk(groupId);
        await user.addGroup(group);
        res.status(200).json({message: 'User is added to Group'})
    } catch(err) {
        console.log('Error @addUsetToGroup', err);
        res.status(500).json({message: 'Internal Server Error'})
    }
}

exports.fetchAllMessages = async (req, res, next) => {
    const groupId = req.body.groupId;
    try {
        const messages = await Message.findAll( {where: {groupId: groupId}} )
        if(messages) { res.status(200).json({messages: messages})};
    } catch(err) {
        console.log('error @ fetchAllMessages', err);
        res.status(500).json({ message: 'Messages can"t be fetched' });
    }
    // const lastIndex = req.query.lastIndex;
    // const whereClause = lastIndex ? { id: { [Sequelize.Op.gt]: lastIndex } } : {};

    // const prevMessages = await req.user.getMessages({ 
    //     attributes: ['id', 'message'], 
    //     where: whereClause, 
    //     limit: 10,
    //     order: [['id', 'DESC']]
    // });
    // res.status(200).send(prevMessages);
}