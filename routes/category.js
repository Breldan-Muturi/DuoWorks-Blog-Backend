const express = require('express');
const router = express.Router();
const { create, list, read, remove } = require('../controllers/category');

// validators
const {runValidation} = require('../validators');
const {categoryCreateValidator} = require('../validators/category');
const {requireSignin, adminMiddleware} = require('../controllers/auth');

router.post('/category', categoryCreateValidator, runValidation, requireSignin, adminMiddleware, create);
router.get('/categories', list); //We also use slug below so we can grab it as request params
router.get('/category/:slug', read);  //To get a specific category we use slug instead of id because ID is not SEO
router.delete('/category/:slug', requireSignin, adminMiddleware, remove); //This lets only the Admins delete categories

module.exports = router;


//This is set up so that only Admins can create new categories.