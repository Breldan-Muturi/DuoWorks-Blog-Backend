const mongoose = require('mongoose'); //This will determine what our categoryr schema will look like

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            max: 32
        },
        slug: {
            type: String,
            unique: true,
            index: true //This is because we query the categories based on the slugs
        }
    },
    { timestamp: true }
);

module.exports = mongoose.model('Category', categorySchema);  