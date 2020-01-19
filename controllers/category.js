const Category = require('../models/category');
const Blog = require('../models/blog');
const slugify = require('slugify');
const {errorHandler} = require('../helpers/dbErrorHandler');

exports.create = (req, res) => {  // We need the category name from the request body so we can create a new category
    const {name} = req.body;
    let slug = slugify(name).toLowerCase();

    let category = new Category({name, slug});

    category.save((err, data) => {
        if(err) {
            return res.status(400).json({
                error: errorHandler(err) //We need helper functions so we can return error messages exactly.
            });
        }
        res.json(data);
    });
};

exports.list = (req,res) => {
    Category.find({}).exec((err, data) => {
        if(err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};

exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Category.findOne({slug}).exec((err, category) => {
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        // res.json(category); //Once we have the blogs we'll be thining of how to return the ctegories with the blogs
         Blog.find({categories: category})
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name username')
            .select('_id total slug excerpt categories postedBy tags createdAt updatedAt')
            .exec((err, data) => {
                if(err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json({category: category, blogs: data});
            });
    }); 
};

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Category.findOneAndRemove({slug}).exec((err, data) => {
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message:'Category deleted successfully'
        }); //Once we have the blogs we'll be thining of how to return the ctegories with the blogs
    }); 
}


//This is where we create methods involved in our categories hoe they are saved created listed removed and even searched