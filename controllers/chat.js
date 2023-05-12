const path = require('path');
const rootDir = require('../util/path');
const Sequelize = require('sequelize');

exports.getChatApp = (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'chat.html'));
}


exports.postMessage = (req, res, next) => {
    const message = req.body.message;
    req.user.createMessage({
        message: message
    })
    .then(result => res.status(200).json({ messageCreated: true }))
    .catch(error => res.status(500).json({ messageCreated: false }))
}

exports.fetchAllMessages = async (req, res, next) => {
    const lastIndex = req.query.lastIndex;
    const whereClause = lastIndex ? { id: { [Sequelize.Op.gt]: lastIndex } } : {};

    const prevMessages = await req.user.getMessages({ 
        attributes: ['id', 'message'], 
        where: whereClause, 
        limit: 10,
        order: [['id', 'DESC']]
    });
    res.status(200).send(prevMessages);
}