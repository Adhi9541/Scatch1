const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middlewares/isLoggedIn');
const productModel = require('../models/products-model');
const userModel = require('../models/user-model');
const upload1 = require('../config/multerconfig');
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
   key_id: process.env.RAZORPAY_KEY_ID,
   key_secret: process.env.RAZORPAY_KEY_SECRET
});


router.get('/', (req, res) => {
    let error = req.flash("error");
    res.render('index', { error , loggedin : false });
});


router.get('/shop', isLoggedIn , async (req, res) => {

    let sortby = req.query.sortby;
    let filter = req.query.filter;

    let products;
    if(sortby === "newest"){
        products = await productModel.find().sort({_id : -1});
    }
    else if(filter === "discount"){
        products = await productModel.find({discount : {$gt : 0}});
    }
    else if(filter === "newcollection"){
        products = await productModel.find().sort({_id : -1}).limit(10);
    }
    else if(filter === "all"){
        products = await productModel.find();
    }
    else{
        products = await productModel.find();
    }

    let success = req.flash("success");
    res.render("shop", {products , success, loggedin : true});
});

// this is for the add to cart functionality, we will be using the user model to add the product id to the cart array of the user

router.get('/addtocart/:id', isLoggedIn, async (req, res) => {
   try {
      let user = await userModel.findOne({ email: req.user.email });
      if (!user) {
         return res.status(404).send("User not found");
      }
      let productId = req.params.id;
      // Remove any broken cart items automatically
      user.cart = user.cart.filter(item => item && item.product);
      let existingIndex = user.cart.findIndex(item =>
         item.product.toString() === productId
      );
      if (existingIndex !== -1) {
         user.cart[existingIndex].quantity += 1;
      } else {
         user.cart.push({
            product: productId,
            quantity: 1
         });
      }
      await user.save();
      console.log(user.cart);
      req.flash('success', 'Product added successfully!');
      res.redirect('/shop');

   } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
   }
});

router.get('/cart', isLoggedIn, async (req, res) => {
   try {
      let user = await userModel.findOne({ email: req.user.email })
         .populate('cart.product');

      let grandTotal = 0;

      user.cart.forEach(item => {
         if (!item.product) return;

         let price = Number(item.product.price);
         let discount = Number(item.product.discount);
         let quantity = Number(item.quantity);

         let total = (price - discount + 20) * quantity;
         grandTotal += total;
      });

      res.render('cart', { user, grandTotal });

   } catch (err) {
      console.log(err);
      res.status(500).send("Error loading cart");
   }
});

router.post('/cart/increase/:id', isLoggedIn, async (req, res) => {
   try {
      let user = await userModel.findOne({ email: req.user.email });

      let item = user.cart.find(
         item => item.product.toString() === req.params.id
      );

      if (item) {
         item.quantity += 1;
         await user.save();
      }

      res.redirect('/cart');
   } catch (err) {
      console.log(err);
      res.status(500).send("Error increasing quantity");
   }
});

router.post('/cart/decrease/:id', isLoggedIn, async (req, res) => {
   try {
      let user = await userModel.findOne({ email: req.user.email });

      let itemIndex = user.cart.findIndex(
         item => item.product.toString() === req.params.id
      );

      if (itemIndex !== -1) {
         if (user.cart[itemIndex].quantity > 1) {
            user.cart[itemIndex].quantity -= 1;
         } else {
            // Remove if quantity becomes 0
            user.cart.splice(itemIndex, 1);
         }
         await user.save();
      }

      res.redirect('/cart');
   } catch (err) {
      console.log(err);
      res.status(500).send("Error decreasing quantity");
   }
});

router.post('/cart/remove/:id', isLoggedIn, async (req, res) => {
   try {
      let user = await userModel.findOne({ email: req.user.email });

      user.cart = user.cart.filter(
         item => item.product.toString() !== req.params.id
      );

      await user.save();

      res.redirect('/cart');
   } catch (err) {
      console.log(err);
      res.status(500).send("Error removing item");
   }
});

router.get('/logout',isLoggedIn, (req, res) => {
    res.render("shop");
});

router.get('/account', isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({email : req.user.email});
    res.render('account', {user} )
});

router.post('/upload', isLoggedIn, upload1.single("image"), async (req, res) => {
  
  let user = await userModel.findOne({ email: req.user.email });
  console.log(req.file); // Check the uploaded file details
  user.profileImage = req.file.filename; // Make sure this field exists in schema
  await user.save();
  req.flash("success", "Profile image uploaded successfully!");
  res.redirect('/account');
});

router.post('/create-order', isLoggedIn, async (req, res) => {
   try {
      let user = await userModel.findOne({ email: req.user.email })
         .populate('cart.product');

      let grandTotal = 0;

      user.cart.forEach(item => {
         let price = Number(item.product.price);
         let discount = Number(item.product.discount);
         let quantity = Number(item.quantity);

         grandTotal += (price - discount + 20) * quantity;
      });

      const options = {
         amount: grandTotal * 100, // Razorpay works in paise
         currency: "INR",
         receipt: "order_rcptid_" + Date.now()
      };

      const order = await razorpay.orders.create(options);

      res.json({
         success: true,
         order,
         key_id: process.env.RAZORPAY_KEY_ID
      });

   } catch (err) {
      console.log(err);
      res.status(500).send("Error creating Razorpay order");
   }
});

router.post('/verify-payment', isLoggedIn, async (req, res) => {
   try {
      let user = await userModel.findOne({ email: req.user.email })
         .populate('cart.product');

      user.orders.push({
         products: user.cart,
         paymentId: req.body.razorpay_payment_id,
         date: new Date()
      });

      user.cart = [];
      await user.save();

      res.json({ success: true });

   } catch (err) {
      console.log(err);
      res.status(500).send("Payment verification failed");
   }
});

router.get("/details" , (req,res)=>{
   res.render("details");
})

router.post("/details", isLoggedIn, async (req, res) => {
   try {

      let user = await userModel.findOne({ email: req.user.email })
         .populate("cart.product");

      if (!user) {
         req.flash("error", "User not found");
         return res.redirect("/login");
      }

      let grandTotal = 0;

      user.cart.forEach(item => {
         let price = Number(item.product.price);
         let discount = Number(item.product.discount);
         let quantity = Number(item.quantity);

         grandTotal += (price - discount + 20) * quantity;
      });

      user.orders.push({
         products: user.cart.map(item => ({
            product: item.product._id,
            quantity: item.quantity
         })),
         address: {
            fullname: req.body.fullname,
            mobile: req.body.mobile,
            house: req.body.house,
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
            country: req.body.country
         },
         totalAmount: grandTotal,
         paymentId: "COD",
         status: "Placed"
      });

      user.cart = [];
      

      await user.save();

      req.flash("success", "save the details successfully ✅");
      return res.redirect("/cart");

   } catch (err) {
      console.log(err);
      req.flash("error", "Something went wrong");
      return res.redirect("/cart");
   }
});




module.exports = router; 