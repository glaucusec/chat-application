// npm packages
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors')

// user packages
const sequelize = require('./util/database');

// routes
const routes = require('./routes/user');

const app = express();

app.use(cors( { origin: '*' } ))

app.use(bodyParser.json());

app.use('/', routes);

sequelize.sync()
.then(result => {
    app.listen(3000);
})
.catch(err => console.log('%app.js% --->', err));