const jwt = require('jsonwebtoken');
const User = require('../models/User.model.js');

const protect = async(req, res, next) =>{
    let token;

    if(req.header.authorization && req.header.authorization.startsWith('Bearer')){
        try {
            token = req.header.authorization.split(' ')[1];
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decode.id).select('-password');
            if(!req.user){
                return res(401).json({
                    success:false,
                    message: 'User not found'
                });
            }
            next();
        } catch (error) {
            console.error('Authorization Error: ', error);
            return res.status(401).json({
                success: false,
                message: 'Not authoried, token failed'
            });
        }
    }
    if(!token){
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }
};

module.exports = { protect};