const path = require('path');
const rootDir = require('../util/path');

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
    let messages
    const prevMessages = await req.user.getMessages( { attributes: ['message'] } );
    if(prevMessages && prevMessages.length > 0) { 
        messages = prevMessages.map((messageObj) => messageObj.message) 
        res.status(200).json(messages)
    } else {
        res.sendStatus(204);
    };
}