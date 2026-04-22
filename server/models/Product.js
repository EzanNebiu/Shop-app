const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    emri: {
        type: String,
        required: [true, 'Emri i produktit eshte i detyrueshm'],
        trim: true
    },
    pershkrimi: {
        type: String,
        required: [true, 'Pershkrimi eshte i detyrueshm']
    },
    cmimi: {
        type: Number,
        required: [true, 'Cmimi eshte i detyrueshm'],
        min: [0, 'Cmimi nuk mund te jete negativ']
    },
    stoku: {
        type: Number,
        required: [true, 'Stoku eshte i detyrueshm'],
        min: [0, 'Stoku nuk mund te jete negativ'],
        default: 0
    },
    foto: {
        type: String,
        default: 'https://via.placeholder.com/300'
    },
    kategoria: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
