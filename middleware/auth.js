const jwt = require('jsonwebtoken');
const User = require('../models/user');
const path = require('path');
const rootDir = require('../util/path');

require('dotenv').config();

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token) { return res.sendFile(path.join(rootDir, 'views', 'unauthorized.html')) }
        const user = jwt.verify(token, process.env.TOKEN_SECRET);
        const userDetails = await User.findById(user.id);
        if(!userDetails) { 
            console.log('userDetails can"t be fetched@authenticate:auth.js')
            return res.status(404).json( {message: 'Not Authorized'} ) 
        }
        req.user = user
        console.log('userDetails fetched and authenticated@authenticate:auth.js');
        next();
    } catch(err) {
        console.log(err);
        res.status(500).json({error: 'Internal server Error'})
    }
}