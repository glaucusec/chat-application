const path = require('path');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
require('dotenv').config();

const rootDir = require('../util/path')

const User = require('../models/user');

function generateAccessToken(id, name) {
    return jwt.sign( { id: id, name: name }, process.env.TOKEN_SECRET)
}

exports.getSignUpPage = (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'signup.html'))
}

exports.postSignUpForm = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ where: { email: email } })
        if(userExists) { return res.status(409).json({ userExists: true })}

        const saltrounds = 10;
        const encryptedPassword = await bcrypt.hash(password, saltrounds);
        await User.create( { name: name, email: email, password: encryptedPassword })
        console.log('New user signed up')
        res.status(201).json( { message: "User created successfully" })

    } catch (error) {
        console.log('Error@postSignUpForm -->', error);
        res.status(500).json({ error: 'Internal Sever Error' })
    }
}

exports.getLoginPage = (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'login.html'));
}

exports.postLoginData = async (req, res, next) => {
    const { email, password } = req.body;
    const maxAge = 3 * 60 * 60;
    try {
        const userExists = await User.findOne({ email: email })
        console.log(userExists)
        if(!userExists) { return res.status(404).json({ error: "User not found" })}
        const passwordsMatch = await bcrypt.compare(password, userExists.password);
        if(passwordsMatch) { 
            const token = generateAccessToken(userExists._id, userExists.name)
            console.log(token)
            res.cookie('token', token, {
                httpOnly: true, 
                secure: true, 
                sameSite: 'strict', 
                maxAge: maxAge * 1000, 
              });
            res.status(200).json( { message: 'User login Successful', success: true, token: token })
        } else {
            res.status(401).json( { error: 'Incorrect Password; User not Authorized' });
        }

    } catch(err) {
        console.log('Error@postLoginData--->', err);
        res.status(400).json( { message: "Internal Server Error", error: error.message });
    }
}