const express = require('express');
const router = express.Router();
const upload = require('../config/multer-config');
const productModel = require('../models/products-model');

router.post('/create', upload.single('image'), async (req, res) => {
    // Add validation to check if file was uploaded
    if (!req.file) {
        return res.status(400).send({ error: 'No file uploaded. Please upload an image.' });
    }
    
    let product = await productModel.create({
        image: req.file.buffer,
        name: req.body.name,
        price: req.body.price,
        discount: req.body.discount,
        bgcolor: req.body.bgcolor,
        panelcolor: req.body.panelcolor,
        textcolor: req.body.textcolor,
    })
    req.flash('success', 'Product created successfully!');
    res.redirect('/owners/admin');
});

module.exports = router;