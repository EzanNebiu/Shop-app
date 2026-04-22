const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    perdoruesi_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    produkti_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    sasia: {
        type: Number,
        required: [true, 'Sasia eshte e detyrueshme'],
        min: [1, 'Sasia duhet te jete minimum 1']
    },
    cmimi_total: {
        type: Number,
        required: [true, 'Cmimi total eshte i detyrueshm'],
        min: [0, 'Cmimi total nuk mund te jete negativ']
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    data_e_blerjes: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);
