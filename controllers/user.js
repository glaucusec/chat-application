const path = require('path');
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const rootDir = require('../util/path')

const User = require('../models/user');

function generateAccessToken(id, name) {
    return jwt.sign( { user_id: id, user_name: name }, process.env.TOKEN_SECRET)
}

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
        if(userExists) { return res.status(409).json({ error: 'User already exists. Please Login' })}

        const saltrounds = 10;
        const encryptedPassword = await bcrypt.hash(password, saltrounds);
        const userCreated = await User.create( { name: name, email: email, phone: phone, password: encryptedPassword })
        console.log('User created successfully')
        res.status(200).json( { message: "User created successfully" })

    } catch (error) {
        console.log('%user.js(postSignUp) controller%--->', error);
        res.status(500).json({ error: 'Internal Sever Error' })
    }
}

exports.getLoginPage = (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'login.html'));
}

exports.postLoginData = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const userExists = await User.findOne({
            where: {
                email: email
            }
        })
        if(!userExists) { return res.status(404).json({ error: "User not found" })}
        const passwordsMatch = await bcrypt.compare(password, userExists.password);
        if(passwordsMatch) { 
            res.status(200).json( { message: 'User login Successful', success: true, token: generateAccessToken(userExists.id, userExists.name) })
        } else {
            res.status(401).json( { error: 'Incorrect Password; User not Authorized' });
        }

    } catch(err) {
        console.log('%user.js(postLogin) controller%--->', err);
        res.status(500).json( { error: "Internal Server Error" });
    }
}