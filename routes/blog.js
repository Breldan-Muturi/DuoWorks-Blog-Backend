const express = require('express');
const router = express.Router();
const {create, list, listAllBlogsCategoriesTags, read, remove, update, photo, listRelated, listSearch} = require('../controllers/blog');
const {requireSignin, adminMiddleware} = require('../controllers/auth');

router.post('/blog',requireSignin, adminMiddleware, create);
router.get('/blogs', list);
router.post('/blogs-categories-tags',listAllBlogsCategoriesTags);
router.get('/blog/:slug',read);
router.delete('/blog/:slug',requireSignin, adminMiddleware, remove);// Middleware here is to ensure only admins can remove blogs
router.put('/blog/:slug',requireSignin, adminMiddleware, update);//Updating 
router.get('/blog/photo/:slug', photo);
router.post('/blogs/related', listRelated);
router.get('/blogs/search', listSearch);

module.exports = router;