// npm packages
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');

// user packages
const sequelize = require('./util/database');

// routes
const routes = require('./routes/user');

// models
const User = require('./models/user');
const Message = require('./models/message');
const Group = require('./models/group');
const GroupMember = require('./models/groupmember');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(cors( { origin: '*' } ))
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', routes(io));
app.use('/', express.static(__dirname + '/public'))

User.belongsToMany(Group, { through: GroupMember, foreignKey: 'memberId'} );
Group.belongsToMany(User, { through: GroupMember, foreignKey: 'groupId' });

User.hasMany(Message, { foreignKey: 'senderId' })
Group.hasMany(Message, { foreignKey: 'groupId' })
Message.belongsTo(User, { foreignKey: 'senderId' })
Message.belongsTo(Group, { foreignKey: 'groupId' })

sequelize
// .sync({force:true})
.sync()
.then(result => {
    httpServer.listen(3000);
})
.catch(err => console.log('%app.js% --->', err));