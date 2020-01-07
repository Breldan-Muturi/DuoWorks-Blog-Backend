const express = require('express');
const router = express.Router();
const {signup, signin, signout, requireSignin} = require('../controllers/auth');

// validators
const {runValidation} = require('../validators');
const {userSignupValidator, userSigninValidator} = require('../validators/auth');

router.post('/signup', userSignupValidator, runValidation, signup);  //We apply our validators here as middleware so only if the validation is passed is the code in the sign up method executed
router.post('/signin', userSigninValidator, runValidation, signin); 
router.get('/signout', signout);

//test
// router.get('/secret', requireSignin, authMiddleware, (req, res) => {
//     res.json({
//         user: req.user  //Makes the user available in the request object
//     });
// });

module.exports = router;