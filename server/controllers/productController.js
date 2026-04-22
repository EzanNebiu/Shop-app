const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.json({ error: false, products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, mesazhi: 'Server error' });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: true, mesazhi: 'Produkti nuk u gjet' });
        }
        
        res.json({ error: false, product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, mesazhi: 'Server error' });
    }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        const { emri, pershkrimi, cmimi, stoku, foto, kategoria } = req.body;
        
        const product = await Product.create({
            emri,
            pershkrimi,
            cmimi,
            stoku,
            foto,
            kategoria
        });
        
        res.status(201).json({ error: false, mesazhi: 'Produkti u krijua me sukses', product });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: true, mesazhi: error.message });
        }
        res.status(500).json({ error: true, mesazhi: 'Server error' });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: true, mesazhi: 'Produkti nuk u gjet' });
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        res.json({ error: false, mesazhi: 'Produkti u perditesua me sukses', product: updatedProduct });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: true, mesazhi: error.message });
        }
        res.status(500).json({ error: true, mesazhi: 'Server error' });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: true, mesazhi: 'Produkti nuk u gjet' });
        }
        
        await Product.findByIdAndDelete(req.params.id);
        
        res.json({ error: false, mesazhi: 'Produkti u fshi me sukses' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, mesazhi: 'Server error' });
    }
};
