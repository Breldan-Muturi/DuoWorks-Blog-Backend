const Blog = require('../models/blog');
const Category = require('../models/category');
const Tag = require('../models/tag');
const User = require('../models/user');
const formidable = require('formidable');//This package handles Form data
const slugify = require('slugify');// Slugify data
const stripHtml = require('string-strip-html');//This strips the HTML so that we can get an excerpt for our blogs
const _ = require('lodash'); //We use the lodash library to update our blogs
const { errorHandler } = require('../helpers/dbErrorHandler'); //Gives us access to the fileSystem 
const fs = require('fs');
const { smartTrim } = require('../helpers/blog');

exports.create = (req, res) => {
    let form = new formidable.IncomingForm(); //This way we get all the form data and we put it in a variable called form
    form.keepExtensions = true;//If we have files in the form we keep the original data such as jpeg png
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not upload'
            });
        }

        const { title, body, categories, tags } = fields; //Handling the fields

        if (!title || !title.length) {
            return res.status(400).json({
                error: 'title is required'
            });
        }

        if (!body || body.length < 200) {
            return res.status(400).json({
                error: 'Content is too short'
            });
        }

        if (!categories || categories.length === 0) {
            return res.status(400).json({
                error: 'At least one category is required'
            });
        }

        if (!tags || tags.length === 0) {
            return res.status(400).json({
                error: 'At least one tag is required'
            });
        }

        let blog = new Blog();
        blog.title = title;
        blog.body = body;
        blog.excerpt = smartTrim(body, 320, ' ', ' ...'); //tirm our body so we can create excerpts for our snippets
        blog.slug = slugify(title).toLowerCase();
        blog.mtitle = `${title} | ${process.env.APP_NAME}`;
        blog.mdesc = stripHtml(body.substring(0, 160));
        blog.postedBy = req.user._id;
        // categories and tags
        let arrayOfCategories = categories && categories.split(',');
        let arrayOfTags = tags && tags.split(',');

        if (files.photo) {
            if (files.photo.size > 10000000) {
                return res.status(400).json({
                    error: 'Image should be less then 1mb in size'
                });
            }
            blog.photo.data = fs.readFileSync(files.photo.path);
            blog.photo.contentType = files.photo.type;
        }

        blog.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            // res.json(result);
            Blog.findByIdAndUpdate(result._id, { $push: { categories: arrayOfCategories } }, { new: true }).exec(
                (err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    } else {
                        Blog.findByIdAndUpdate(result._id, { $push: { tags: arrayOfTags } }, { new: true }).exec(
                            (err, result) => {
                                if (err) {
                                    return res.status(400).json({
                                        error: errorHandler(err)
                                    });
                                } else {
                                    res.json(result);
                                }
                            }
                        );
                    }
                }
            );
        });
    });
};

// list, listAllBlogsCategoriesTags, read, remove, update
exports.list = (req, res) => {
    Blog.find({})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username')  
        .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
};

exports.listAllBlogsCategoriesTags = (req, res) => {  //We use post method in the router to get access to req.body
    let limit = req.body.limit ? parseInt(req.body.limit): 10
    let skip = req.body.skip ? parseInt(req.body.skip): 0
    let blogs
    let categories
    let tags
    Blog.find({})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username profile') 
        .sort({createdAt: -1}) 
        .skip(skip)
        .limit(limit)
        .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')        
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            blogs = data; //blogs
            //get categories
            Category.find({}).exec((err, c) => {
                if(err) {
                    return res.json({
                        error: errorHandler(err)
                    });
                }
                categories = c; // categories
                //get tags
                Tag.find({}).exec((err, t) => {
                    if(err) {
                        return res.json({
                            error: errorHandler(err)
                        });
                    }
                    tags = t;
                    //return all blogs categories and tags as JSON response
                    res.json({blogs, categories, tags, size: blogs.length});
                });
            });

        });
};

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase()
    Blog.findOne({slug})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name username')  
        .select('_id title body slug mtitle mdesc categories tags postedBy createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
};

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOneAndRemove ({slug}).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'Blog deleted successfully'
        });
    });
};

exports.update = (req, res) => {
    const slug = req.params.slug.toLowerCase();//We need to know which blog we are updating

    Blog.findOne({slug}).exec((err, oldBlog) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }         

        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.parse(req, (err, fields, files) => {
            if (err) {
                return res.status(400).json({
                    error: 'Image could not upload'
                });
            }
            //We only want to update the fields the user changes. The slug never changes even if the title is edited becuse the slug is indexed by google because thats bad for SEO
            let slugBeforeMerge = oldBlog.slug;
            oldBlug = _.merge(oldBlog, fields);
            oldBlog.slug = slugBeforeMerge;

            const{body, desc, categories, tags} = fields;

            if(body) {
                oldBlog.excerpt = smartTrim(body, 320, ' ', ' ...');
                oldBlog.desc = stripHtml(body.substring(0, 160));                  
            }

            if (categories) {
                oldBlog.categories = categories.split(',');
            }

            if(tags) {
                oldBlog.tags = tags.split(',');
            }

            if (files.photo) {
                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        error: 'Image should be less then 1mb in size'
                    });
                }
                oldBlog.photo.data = fs.readFileSync(files.photo.path);
                oldBlog.photo.contentType = files.photo.type;
            }
            oldBlog.save((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json(result); 
            });
        });
    });
};

exports.photo = (req,res) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({slug})
        .select('photo')
        .exec((err, blog) => {
            if(err || !blog) {
                return res.status(400).json({
                    error:errorHandler(err)
                });
            }
            res.set('Content-Type', blog.photo.contentType);
            return res.send(blog.photo.data);
        });
};

exports.listRelated = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 3; // You can change how many related blogs you want to show from here
    const {_id, categories} = req.body.blog;

    Blog.find({_id: {$ne: _id}, categories: {$in: categories}})
    .limit(limit)
    .populate('postedBy', '_id username profile')
    .select('title slug excerpt postedBy createdBy updatedAt')
    .exec((err, blogs) => {
        if(err) {
            return res.status(400).json({
                error: 'Blogs not found'
            });
        }
        res.json(blogs);
    });
};

exports.listSearch = (req,res) => { //We want our search based on the tilte or body
    console.log(req.query);
    const {search} = req.query;
    if (search) {
        Blog.find({
            $or: [{title: {$regex: search, $options: 'i'}}, {body: {$regex: search, $options: 'i'}}]
        }, (err, blogs) => {
            if(err){
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(blogs);
        }).select('-photo -body'); //We deselect photo and body because these are huge files when you consiedr searching
    }
};

exports.listByUser = (req, res) => {
    User.findOne({ username: req.params.username }).exec((err, user) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let userId = user._id;
        Blog.find({ postedBy: userId })
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name username')
            .select('_id title slug postedBy createdAt updatedAt')
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json(data);
            });
    });
};
    