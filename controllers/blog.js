const Blog =  require('../models/blog');
const Category = require('../models/category');
const Tag = require('../models/tag');
const formidable = require('formidable'); //This package handles Form data
const slugify = require('slugify'); // Slugify data
const stripHtml = require('string-strip-html'); //This strips the HTML so that we can get an excerpt for our blogs
const _ = require('lodash');  //We use the lodash library to update our blogs
const {errorHandler} = require('../helpers/dbErrorHandler');
const fs = require('fs'); //Gives us access to the fileSystem 
const { smartTrim} = require('../helpers/blog');

exports.create = (req, res) => {
    let form = new formidable.IncomingForm();  //This way we get all the form data and we put it in a variable called form
    form.keepExtensions = true; //If we have files in the form we keep the original data such as jpeg png
    form.parse(req, (err, fields, files) => {
        if(err) {
            return res.status(400).json({
                error: 'Image could not upload'
            });  //Handling the errors
        }

        const {title, body, categories, tags} = fields;  //Handling the fields

        if(!title || !title.length) {
            return res.status(400).json({
                error: 'Title is required'
            });
        }

        if(!body || body.length < 200) {
            return res.status(400).json({
                error: 'Content is too short'
            });
        }

        if(!categories || categories.length == 0) {
            return res.status(400).json({
                error: 'At least one category is required'
            });
        }

        if(!tags || tags.length == 0) {
            return res.status(400).json({ 
                error: 'At least one tag is required'
            });  
        }
        
        let blog = new Blog();
        blog.title = title;
        blog.body = body;
        blog.excerpt = smartTrim(body, 320, ' ', ' ...');  //tirm our body so we can create excerpts for our snippets
        blog.slug = slugify(title).toLowerCase();
        blog.mtitle = `${title} | ${process.env.APP_NAME}`;
        blog.mdesc = stripHtml(body.substring(0,160));
        blog.postedBy = req.user._id;
        //Array of Categories and Tags
        let arrayOfCategories = categories && categories.split(',');
        let arrayOfTags = tags && tags.split(',');

        if(files.photo) {
            if(files.photo.size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1MB in size'
                });
            }
            blog.photo.data = fs.readFileSync(files.photo.path);
            blog.photo.contentType = files.photo.type; 
        }

        blog.save((err, result)=> {
            if(err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
             }
            //  res.json(result);
            Blog.findByIdAndUpdate(result._id, {$push: {categories: arrayOfCategories}}, {new: true}).exec((err, result) => {
                if(err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                } else {
                    Blog.findByIdAndUpdate(result._id, {$push: {tags: arrayOfTags}}, {new: true}).exec((err, result) => {
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            });         
                        } else {
                            res.json(result);
                        }
                    });                    
                }
            });
        });
    });  //We return all form data as javascript objects
};