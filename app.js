const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sequelize = require('./util/database');

const userRoutes = require('./routes/user');

const app = express();

app.use(bodyParser.json());

app.use('/user', userRoutes);

sequelize.sync()
.then(result => {
    app.listen(3000);
})
.catch(err => console.log('%app.js% --->', err));