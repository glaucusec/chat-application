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