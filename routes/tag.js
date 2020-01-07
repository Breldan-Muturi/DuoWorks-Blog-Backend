const express = require('express');
const router = express.Router();

//controllers
const {requireSignin, adminMiddleware} = require('../controllers/auth');
const { create, list, read, remove } = require('../controllers/tag');

// validators
const {runValidation} = require('../validators');
const {createTagValidator} = require('../validators/tag');

router.post('/tag', createTagValidator, runValidation, requireSignin, adminMiddleware, create);
router.get('/tags', list); //We also use slug below so we can grab it as request params
router.get('/tag/:slug', read);  //To get a specific tag we use slug instead of id because ID is not SEO
router.delete('/tag/:slug', requireSignin, adminMiddleware, remove); //This lets only the Admins delete tags

module.exports = router;


//This is set up so that only Admins can create new tags.