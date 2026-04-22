const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    emri: {
        type: String,
        required: [true, 'Emri eshte i detyrueshm'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email eshte i detyrueshm'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email jo valid']
    },
    fjalekalimi: {
        type: String,
        required: [true, 'Fjalekalimi eshte i detyrueshm'],
        minlength: [6, 'Fjalekalimi duhet te kete min 6 karaktere']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('fjalekalimi')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.fjalekalimi = await bcrypt.hash(this.fjalekalimi, salt);
});

// Method to compare password
UserSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.fjalekalimi);
};

module.exports = mongoose.model('User', UserSchema);
