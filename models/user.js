const mongoose = require('mongoose');

const Schema = mongoose.Schema

const userSchema = new Schema( {
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('User', userSchema)

// const User = sequelize.define('user', {
//     id: {
//         type: Sequelize.INTEGER, 
//         autoIncrement: true, 
//         primaryKey: true, 
//         allowNull: false,
//     },
//     name: {
//         type: Sequelize.STRING, 
//         allowNull: false, 
//     }, 
//     email: {
//         type: Sequelize.STRING, 
//         allowNull: false
//     },
//     phone: {
//         type: Sequelize.STRING, 
//         allowNull: false, 
//     },
//     password: {
//         type: Sequelize.STRING, 
//         allowNull: false
//     }
// }, {
//     timestamps: false
// })

// module.exports = User;

