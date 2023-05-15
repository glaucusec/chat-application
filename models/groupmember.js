const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const GroupMember = sequelize.define('GroupMember', {
    isAdmin: Sequelize.BOOLEAN,
}, { timestamps: false })

module.exports = GroupMember;