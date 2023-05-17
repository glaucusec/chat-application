// npm packages
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');
const formData = require('express-form-data');
const os = require('os');
let CronJob = require('cron').CronJob;


// user packages
const sequelize = require('./util/database');

// routes
const routes = require('./routes/user');

// models
const User = require('./models/user');
const Message = require('./models/message');
const Group = require('./models/group');
const GroupMember = require('./models/groupmember');
const ArchiveMessage = require('./models/archive');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const options = {
    uploadDir: os.tmpdir(),
    autoClean: true,
};
app.use(express.json()); // This is default way of parsing JSON in our server
app.use(formData.parse(options)); 
app.use(formData.format()); // Format null key value pairs
app.use(formData.stream()); // Convert our files to stream 
app.use(formData.union()); // Merging the req.files object to our req.body object

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

let job = new CronJob(
    '0 0 0 * * *', 
    moveRowsOneDayOld,
    null,
    true,
);
async function moveRowsOneDayOld() {
    try {
        const users = await Message.findAll();
        const currentTime = new Date();
        const oneDayAgo = new Date(currentTime.getTime() - (24 * 60 * 60 * 1000));
        console.log(oneDayAgo);
        const rowsToMove = users.filter(user => user.createdAt <= oneDayAgo);
        for (const row of rowsToMove) {
            const newRow = await ArchiveMessage.create({
                id: row.id,
                message: row.message,
            });
            await Message.destroy( {where: { id: row.id }})
            console.log(`Row ${ row.id } moved successfully`);
        }
        console.log('All rows moved successfully');
    } catch(err) {
        console.log(err);
    }
}



sequelize
// .sync({force:true})
.sync()
.then(result => {
    httpServer.listen(3000);
    moveRowsOneDayOld();
})
.catch(err => console.log('%app.js% --->', err));