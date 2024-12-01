const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    imageUrl: String,
    category: String,
    keywords: [String],
    somaliKeywords: [String],
    englishKeywords: [String],
    brand: String,
    tags: [String]
});

module.exports = mongoose.model('Product', productSchema);