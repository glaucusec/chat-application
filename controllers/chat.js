const path = require('path');
const rootDir = require('../util/path');

exports.getChatApp = (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'chat.html'));
}
