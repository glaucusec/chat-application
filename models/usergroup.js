const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User_Group = sequelize.define('user_group', {

}, { timestamps: false, tableName: 'User_Group' } )

module.exports = User_Group;