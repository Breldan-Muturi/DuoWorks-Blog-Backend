const Tag = require('../models/tag');
const slugify = require('slugify');
const {errorHandler} = require('../helpers/dbErrorHandler');

exports.create = (req, res) => {  // We need the tag name from the request body so we can create a new tag
    const {name} = req.body;
    let slug = slugify(name).toLowerCase();

    let tag = new Tag({name, slug});

    tag.save((err, data) => {
        if(err) {
            return res.status(400).json({
                error: errorHandler(err) //We need helper functions so we can return error messages exactly.
            });
        }
        res.json(data);
    });
};

exports.list = (req,res) => {
    Tag.find({}).exec((err, data) => {
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

    Tag.findOne({slug}).exec((err, tag) => {
        if(err){
            return res.status(400).json({
                error: 'Tag not found'
            });
        }
        res.json(tag); //Once we have the blogs we'll be thining of how to return the ctegories with the blogs
    }); 
}

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Tag.findOneAndRemove({slug}).exec((err, data) => {
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message:'Tag deleted successfully'
        }); //Once we have the blogs we'll be thining of how to return the Tags with the blogs
    }); 
}

