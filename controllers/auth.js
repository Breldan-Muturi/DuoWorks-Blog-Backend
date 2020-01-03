const User = require('../models/user');
const shortId = require('shortid');
const jwt  =  require('jsonwebtoken');
const expressJwt =require('express-jwt'); //Check whether the token has expired or is valid. Before we generate a token we need to create a secret key in the .env

exports.signup = (req, res) => {
    //console.log(req.body);
    User.findOne({ email: req.body.email }).exec((err, user) => { //Check if a user exists.We dont add user if email exists
        if(user) {
            return res.status(400).json({
                error: 'Email already exists'
            });
        }

        const {name, email, password} = req.body;
        let username = shortId.generate();
        let profile = `${process.env.CLIENT_URL}/profile/${username}`;

        let newUser = new User({name, email, password, profile, username});
        newUser.save((err, success) => {
            if (err) {
                return res.status(400).json({
                    error:err
                });
            }
            // res.json({
                // user: success
            // });
            res.json({
                message: 'Signup success! Please signin.'
            });
        });
    });
};

exports.signin = (req, res) => {
    const{email, password} = req.body;
    //check if user exists
    User.findOne ({email}).exec((err, user) => {  //We just use email because we anticipate the key value will match
        if(err|| !user) {
            return res.status(400).json({
                error:'User with that email does not exist. Please signup.'
            });
        }
    
    //authenticate
    if (!user.authenticate(password)) {  //The password in authenticate is the plain password we get from client
        return res.status(400).json({
            error:'Email and password do not match.'
        });
    }
    //generate a token and send to client
    const token  = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'}); //We use the sign methos to create a signed token. We also give an expiry date. We use the token when there is need for us to access protected routes.
    res.cookie('token', token, {expiresIn: '1d'});
    const {_id, username, name, email, role} = user;
    return res.json({
        token,
        user: {_id, username, name, email, role}
    }); 
    });
};

exports.signout = (req,res) => {
    res.clearCookie('token');
    res.json({
        message: 'Signout success!'
    });
};

exports.requireSignin = expressJwt({ //We apply this middleware in our routes so any routes we want to protect only for the logged in users it will check the incoming token's secret and compare with the secret we passed here
    secret: process.env.JWT_SECRET //If the tokens match and the token hasnt expired this returns true and user is granted access
});