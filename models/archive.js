const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const ArchiveMessage = sequelize.define('archivemessage', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = ArchiveMessage;