const path = require('path');
const rootDir = require('../util/path');
// const Sequelize = require('sequelize');

const Message = require('../models/message');
const User = require('../models/user');
const Group = require('../models/group');
const GroupMember = require('../models/groupmember');

const S3Services = require('../services/s3services');


exports.getChatApp = (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'chat.html'));
}

exports.createNewGroup = async (req, res, next) => {
    const groupName = req.body.group_name;
    try {
        await Group.create( { name: groupName });
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
    // const message = req.body.message;
    // const groupId = req.body.group_id;
    // try {
    //     await req.user.createMessage({ message: message, groupId: groupId, senderId: req.user.id })
    //     res.status(200).json({ messageCreated: true });
    // } catch(err) {
    //     console.log('error @ createNewMessage', err);
    //     res.status(500).json({ messageCreated: false });
    // }
}

exports.imageUpload = async (req, res, next) => {
    const filePath = req.body.file.path;
    const fileExtension = (
        filePath.substring(filePath.lastIndexOf('.') + 1) + ''
    ).toLowerCase();
    try {
        const fileURL = await S3Services.uploadToS3(req.body.file, new Date().toString() + '.' + fileExtension);
        res.status(200).json({ fileURL: fileURL });
    }catch(err) {
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'})
    }
}

exports.addUserToGroup = async(req, res, next) => {
    const groupId = req.body.groupId;
    const userId = req.body.newUserId;
    try {
        const user = await User.findOne({where: { id: userId }})
        if(!user) {
            console.log('User not Found@addUserToGroup');
            return res.status(404).json({message: 'User Not Found'})
        }
        const users = await GroupMember.findAll({where: { groupId: groupId, memberId: userId }})
        if(users.length) {
            console.log('User is a Existing Member');
            return res.status(409).json( { message: 'User is an Existing Member' })
        }
        const group = await GroupMember.create({ groupId: groupId, memberId: userId })
        res.status(200).json({message: 'User is added to Group'})
    } catch(err) {
        console.log('Error @addUsetToGroup', err);
        res.status(500).json({message: 'Internal Server Error'})
    }
}

exports.removeUserFromGroup = async(req, res, next) => {
    const groupId = req.body.groupId;
    const memberId = req.body.memberId;

    try {
        await GroupMember.destroy({where: { groupId: groupId, memberId: memberId }})
        res.status(200).json(true);
    } catch(err) {
        res.status(500).json(false);
        console.log(err);
    }
}

exports.makeGroupAdmin = async(req, res, next) => {
    const groupId = Number(req.body.groupId);
    const memberId = req.body.memberId;
    console.log(groupId);
    console.log(memberId);

    try {
        await GroupMember.update({ isAdmin: true } , { where: { groupId: groupId, memberId: memberId } })
        res.status(200).json(true);
    } catch(err) {
        res.status(500).json(false);
        console.log(err);
    }
}

exports.isAdminOrNot = async(req, res, next) => {
    const userId = req.user.id;
    const groupId = req.body.groupId;
    try {
        const isAdmin = await GroupMember.findAll({
            attributes: ['isAdmin'],
            where: { memberId: userId,  groupId: groupId }
        })
        res.status(200).json(isAdmin[0]);
    } catch(err) {
        console.log('Error@isAdminOrNot ->>> ',err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

exports.fetchGroupMembers = async(req, res, next) => {
    const groupId = req.body.groupId;
    try {
        const GroupMembers = await Group.findAll({
            attributes: [],
            where: { id: groupId },
            include: [{
                model: User,
                attributes: ['id','name'],
                through: { attributes: [] }
            }],
        })
        res.status(200).json(GroupMembers[0]['users']);
    } catch(err) {
        console.log('Error@fetchGroupMembers->>',err)
    }
    
    // Group.findAll({
    //     where: { id: groupId },
    //     include: [{
    //         model:User,
    //         attributes: ['name'],
    //         through: { attributes: ['isAdmin'], where: {groupId: groupId} },
    //     }]
    // }).then(result => console.log(JSON.stringify(result, null, 2)))
    // .catch(err => console.log(err));

}

exports.fetchAllMessages = async (req, res, next) => {
    const groupId = req.body.groupId;
    try {
        const messages = await Message.findAll({
            where: { groupId: groupId },
            attributes: ['message'] 
        })
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
