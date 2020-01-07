const User = require('../models/user');
//We make the entire user information available in the request profile inclding hashed password so we try remove that ere below  
exports.read = (req, res) => {
    req.profile.hashed_password = undefined
    return res.json(req.profile); 
};