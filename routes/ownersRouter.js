const express = require("express");
const router = express.Router();
const ownerModel = require("../models/owner-model");
const productModel = require("../models/products-model");
const { logout } = require('../controllers/authController');

router.get("/", function (req, res) {
  res.send("hey it's working");
});

if (process.env.NODE_ENV === "development") {
  router.post("/create", async function (req, res) {
    let owners = await ownerModel.find();
    if (owners.length > 0) {
      return res
        .status(500)
        .send("You don't have permission to create a new owner.");
    }

    let { fullname, email, password } = req.body;

    let createdOwner = await ownerModel.create({
      fullname,
      email,
      password,
    });

    res.status(201).send(createdOwner);
  });
}

router.get("/admin", async function (req, res) {
  let success = req.flash("success");
  res.render("createproducts" , { success});
});

router.get("/allproducts" , async (req,res) =>{
    let products = await productModel.find();
    res.render("allproducts", { products }  );
})

router.get("/logout" , logout) ;








module.exports = router;