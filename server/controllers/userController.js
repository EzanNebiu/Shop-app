const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @desc    Register user / Admin login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, fjalekalimi } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: true, mesazhi: 'Email ose fjalekalimi jane gabim' });
        }

        // Check password
        const isMatch = await user.comparePassword(fjalekalimi);

        if (!isMatch) {
            return res.status(401).json({ error: true, mesazhi: 'Email ose fjalekalimi jane gabim' });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            error: false,
            user: {
                id: user._id,
                emri: user.emri,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, mesazhi: 'Server error' });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-fjalekalimi').sort({ createdAt: -1 });
        res.json({ error: false, users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, mesazhi: 'Server error' });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-fjalekalimi');
        
        if (!user) {
            return res.status(404).json({ error: true, mesazhi: 'Perdoruesi nuk u gjet' });
        }
        
        res.json({ error: false, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, mesazhi: 'Server error' });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: true, mesazhi: 'Perdoruesi nuk u gjet' });
        }
        
        user.emri = req.body.emri || user.emri;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        
        if (req.body.fjalekalimi) {
            user.fjalekalimi = req.body.fjalekalimi;
        }
        
        const updatedUser = await user.save();
        
        res.json({
            error: false,
            mesazhi: 'Perdoruesi u perditesua me sukses',
            user: {
                id: updatedUser._id,
                emri: updatedUser.emri,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, mesazhi: 'Server error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: true, mesazhi: 'Perdoruesi nuk u gjet' });
        }
        
        await User.findByIdAndDelete(req.params.id);
        
        res.json({ error: false, mesazhi: 'Perdoruesi u fshi me sukses' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, mesazhi: 'Server error' });
    }
};
