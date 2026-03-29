const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/myapp');

const userSchema = mongoose.Schema({
fullname: {
    type: String,
    minLength: 3,
    trim: true,
  },
  email: String,
  password: String,
cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product"
      },
      quantity: {
        type: Number,
        default: 1
      }
    }
  ],
orders: [
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product"
        },
        quantity: Number
      }
    ],
    address: {
      fullname: String,
      mobile: String,
      house: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String
    },
    totalAmount: Number,
    paymentId: String,
    status: String,
    date: {
      type: Date,
      default: Date.now
    }
  }
],
  picture: String,
   profileImage: {
    type: String,
    default: ""
  }
});

const User = mongoose.model('user', userSchema);

module.exports = User;