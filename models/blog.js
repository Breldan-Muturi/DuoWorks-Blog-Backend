const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            min: 3,
            max: 160,
            required: true
        },
        slug: {
            type: String,
            unique: true,
            index: true  //Since we'll make a lot  of Database queries based off the title slug we want it indexable
        },
        body: {
            type: {}, //Empty object here allows us to store all kinds of Data binary data, Strings , Html
            required: true,
            min: 200,
            max: 2000000
        },
        excerpt: { //This is a Snippet that users can use to preview our code.
            type: String,
            max: 1000
        },
        mtitle: {
            type: String
        },
        mdesc: {
            type: String
        },
        photo: {
            data: Buffer, //Photos will be saved as a Biniary data format in the database
            contentType: String
        },
        categories: [{ type: ObjectId, ref: 'Category', required: true }],
        tags: [{ type: ObjectId, ref: 'Tag', required: true }],
        postedBy: {
            type: ObjectId,
            ref: 'User'
        }
    },
    { timestamp: true }
);

module.exports = mongoose.model('Blog', blogSchema);