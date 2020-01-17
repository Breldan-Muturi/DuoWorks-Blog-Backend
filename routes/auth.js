const express = require('express');
const router = express.Router();
const {
    signup,
    signin,
    signout,
    requireSignin,
    forgotPassword,
    resetPassword,
    preSignup,
    googleLogin
} = require('../controllers/auth');

// validators
const {runValidation} = require('../validators');
const {
    userSignupValidator,
    userSigninValidator,
    forgotPasswordValidator,
    resetPasswordValidator
} = require('../validators/auth');

router.post('/pre-signup', userSignupValidator, runValidation, preSignup);
router.post('/signup', signup);  //We apply our validators here as middleware so only if the validation is passed is the code in the sign up method executed
router.post('/signin', userSigninValidator, runValidation, signin); 
router.get('/signout', signout);
router.put('/forgot-password', forgotPasswordValidator, runValidation, forgotPassword);
router.put('/reset-password', resetPasswordValidator, runValidation, resetPassword);
// google login
router.post('/google-login', googleLogin);

//test
// router.get('/secret', requireSignin, authMiddleware, (req, res) => {
//     res.json({
//         user: req.user  //Makes the user available in the request object
//     });
// });

module.exports = router;