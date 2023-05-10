const path = require('path');
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');

const rootDir = require('../util/path')

const User = require('../models/user');


exports.getSignUpPage = (req, res, next) => {
    console.log(__dirname);
    res.sendFile(path.join(rootDir, 'views', 'signup.html'))
}

exports.postSignUpForm = async (req, res, next) => {
    const { name, email, phone, password } = req.body;

    try {
        const userExists = await User.findOne({
            where: {
                [Sequelize.Op.or]: [
                    { email: email },
                    { phone: phone}
                ]
            }
        })
        if(userExists) { return res.status(409).json({ error: 'User already exists' })}

        const saltrounds = 10;
        const encryptedPassword = await bcrypt.hash(password, saltrounds);
        const userCreated = await User.create( { name: name, email: email, phone: phone, password: encryptedPassword })
        res.status(200).json( { message: "User created Successfully" })

    } catch (error) {
        console.log('%user.js controller%--->', error);
        res.status(500).json({ error: 'Internal Sever Error' })
    }
    
     
}