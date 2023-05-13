// npm packages
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors')
const cookieParser = require('cookie-parser');

// user packages
const sequelize = require('./util/database');

// routes
const routes = require('./routes/user');

// models
const User = require('./models/user');
const Message = require('./models/message');
const Group = require('./models/group');
const User_Group = require('./models/usergroup');

const app = express();

app.use(cors( { origin: '*' } ))

app.use(bodyParser.json());

app.use(cookieParser());

app.use('/', routes);

User.belongsToMany(Group, { through: 'User_Group', timestamps: false} );
Group.belongsToMany(User, { through: 'User_Group' });

Group.hasMany(Message);
Message.belongsTo(Group);


sequelize
// .sync({force:true})
.sync()
.then(result => {
    app.listen(3000);
})
.catch(err => console.log('%app.js% --->', err));