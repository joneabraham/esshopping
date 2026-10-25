const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const db = require('./src/dbconnection');
const jwt = require('jsonwebtoken');
const User = require('./models/usermodel');
const Cart= require('./models/cart');
const cors = require('cors');
const Productwish = require('./models/wishlist');
const bodyParser = require('body-parser');
const Product=require('./models/adminproducts')
const Payment = require('./models/payment');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const adminRouter=require('./routes/admin')

const sessionTimeout = 1800000;
db.connect()
app.use(cors());
app.use(cookieParser());



app.use(bodyParser.json());
app.use('/admin', adminRouter)



app.get('/special',function (req, res) {
  const  specialEvents = [
    {"specialEventId": "1", "specialEventName": "Event 1"},
    {"specialEventId": "2", "specialEventName": "Event 2"},
    {"specialEventId": "3", "specialEventName": "Event 3"},
  ]
  res.json(specialEvents);
});



app.get('/getproductsfromadmin', verifyToken, async(req,res)=>{
  try {
    const product= await Product.find()
    res.json(product); 
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unknown Error occurred" });
  }
})

app.post('/create_user', async(req, res) => {
  try {
    var { name, email, password } = req.body;
    var password= await bcrypt.hash(password, 10)
    const newUser = new User({ name, email, password });
    newUser.save();
    console.log('User created:', newUser); 
    let payload ={subject :  newUser._id}
    let token= jwt.sign(payload, 'secretKey')
    res.status(201).json({ message: "User created successfully" , token});
  } catch (error) {
    console.log('Error creating user:', error); 
    res.status(500).json({ message: "Error creating user" });
  }
});
 
app.post('/payment', async (req, res) => {
  try {
    const user_id = getUserId(req);
    const date = new Date().toUTCString();
    const { paymentId, amount } = req.body;

    // Build the order from the saved cart, not from the browser, so quantities
    // and prices can't drift from what's in the database.
    const cartItems = await getMergedCart(user_id);
    if (!cartItems.length) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const products = [];
    for (const item of cartItems) {
      const product = await Product.findOne({ Product_Id: item.product_id });
      if (!product) continue;
      const count = item.quantity || 1;
      products.push({
        productId: product.Product_Id,
        name: product.Product_Name,
        price: Number(product.Product_Price) || 0,
        image: product.Product_Image,
        count
      });
      // Reduce stock once, here, at payment time.
      product.Product_Quantity = Math.max(0, (Number(product.Product_Quantity) || 0) - count);
      if (Number(product.Product_Quantity) <= 0) product.Product_Availbility = 'Not Available';
      await product.save();
    }

    await new Payment({ user_id, paymentId, products, amount, date }).save();
    await Cart.deleteMany({ user_id });

    res.status(200).json({ message: 'Payment successful' });
  } catch (error) {
    console.log('Error saving payment:', error);
    res.status(500).json({ message: 'Error making payment' });
  }
});

app.post('/create_wishlist', async (req, res) => {
  try {
    const {
      product_name,
      product_id,
      product_price,
      product_image,
      product_available
    } = req.body;

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'secretKey');
    const user_id = decodedToken.userId;

    const existingProduct = await Productwish.findOne({
      user_id,
      product_id
    });

    if (existingProduct) {
      console.log('Product already exists');
      return res.status(400).json({ message: 'Product already exists' });
    }

    const newProduct = new Productwish({
      product_name,
      product_id,
      product_price,
      product_image,
      product_available,
      user_id
    });

    await newProduct.save();
    console.log('Product added:', newProduct);
    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    console.log('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product' });
  }
});

app.get('/get_wishlist', async (req, res) => {
  try{
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken=jwt.verify(token, 'secretKey');
    const user_id = decodedToken.userId;
    const products = await Productwish.find({user_id})
    if(!products){
      console.log('No products found');
      return res.status(400).json({message: "No products found"});
    }

    res.status(200).json({products});
  } catch(error){
    console.log('Error getting products:', error);
    res.status(500).json({message: "Error getting products"});
  }
});

app.delete('/remove_wishlist', async (req, res) => {
    try{
      const {product_id} = req.body;
      console.log('Product id:', product_id);
      const product = await Productwish.deleteOne({ product_id });
      console.log('Product deleted:', product);
      res.status(200).json({message: "Product deleted successfully"});
    } catch(error){
      console.log('Error deleting product:', error);
      res.status(500).json({message: "Error deleting product"});
    }

});

app.post('/checkwishlist', async(req, res) => {
  try {
    const product_id = req.body.id;
    const product=await Productwish.findOne({product_id});
    if(!product){
      res.status(200).json({message:'a'})
    }
    else{
    res.status(200).json({message:'b'})
    }
  } catch(err) {
    res.status(500).json({ message: "Unknown error occurred" });
  }
});

// Cart helpers -------------------------------------------------------------

function getUserId(req) {
  const token = req.headers.authorization.split(' ')[1];
  return jwt.verify(token, 'secretKey').userId;
}

// Older versions stored one cart document per click. Fold any duplicates for a
// user into a single document per product so quantity lives in one place.
async function getMergedCart(user_id) {
  const docs = await Cart.find({ user_id });
  const byProduct = new Map();
  for (const doc of docs) {
    const qty = doc.quantity || 1;
    const existing = byProduct.get(doc.product_id);
    if (!existing) {
      byProduct.set(doc.product_id, doc);
    } else {
      existing.quantity = (existing.quantity || 1) + qty;
      await existing.save();
      await Cart.deleteOne({ _id: doc._id });
    }
  }
  return [...byProduct.values()];
}

app.post('/addToCart', async (req, res) => {
  try {
    const { product_id } = req.body;
    const user_id = getUserId(req);

    const product = await Product.findOne({ Product_Id: product_id });
    if (!product) {
      return res.status(404).json({ message: "This product is no longer available" });
    }
    const stock = Number(product.Product_Quantity) || 0;

    await getMergedCart(user_id);
    const item = await Cart.findOne({ product_id, user_id });
    const current = item ? (item.quantity || 1) : 0;

    if (current + 1 > stock) {
      return res.status(400).json({
        message: stock <= 0 ? "This product is out of stock" : `Only ${stock} in stock, and they're all in your cart`
      });
    }

    if (item) {
      item.quantity = current + 1;
      await item.save();
      return res.status(200).json({ message: "Quantity updated in cart", quantity: item.quantity });
    }

    await new Cart({ product_id, user_id, quantity: 1 }).save();
    res.status(201).json({ message: "Added to cart", quantity: 1 });
  } catch (error) {
    console.log('Error adding product to cart:', error);
    res.status(500).json({ message: "Couldn't add to cart. Try again." });
  }
});

app.put('/updateCart', async (req, res) => {
  try {
    const { product_id } = req.body;
    const quantity = parseInt(req.body.quantity, 10);
    const user_id = getUserId(req);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const product = await Product.findOne({ Product_Id: product_id });
    if (!product) {
      return res.status(404).json({ message: "This product is no longer available" });
    }
    const stock = Number(product.Product_Quantity) || 0;
    if (quantity > stock) {
      return res.status(400).json({ message: `Only ${stock} in stock`, quantity: stock });
    }

    await getMergedCart(user_id);
    const item = await Cart.findOneAndUpdate({ product_id, user_id }, { quantity }, { new: true });
    if (!item) {
      return res.status(404).json({ message: "This product isn't in your cart" });
    }
    res.json({ message: "Cart updated", quantity: item.quantity });
  } catch (error) {
    console.log('Error updating cart:', error);
    res.status(500).json({ message: "Couldn't update the cart. Try again." });
  }
});

app.get('/getCart', async (req, res) => {
  try {
    const user_id = getUserId(req);
    const items = await getMergedCart(user_id);
    res.json(items);
  } catch (error) {
    console.log('Error getting cart:', error);
    res.status(500).json({ message: "Couldn't load the cart" });
  }
});

app.delete('/removeCart/:id', async (req, res) => {
  try {
    const product_id = req.params.id;
    const user_id = getUserId(req);

    const result = await Cart.deleteMany({ product_id, user_id });
    if (!result.deletedCount) {
      return res.status(400).json({ message: "This product isn't in your cart" });
    }
    res.json({ message: "Removed from cart" });
  } catch (error) {
    console.log('Error removing product from cart:', error);
    res.status(500).json({ message: "Couldn't remove the product. Try again." });
  }
});


app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const session = {
      userId: user._id,
      expiry: Date.now() + sessionTimeout
    };

    const token = jwt.sign(session, 'secretKey');
    user.token = token; 
    await user.save();
    const cookieValue = {
      token,
      sessionIndicator: true,
      sessionEnd: session.expiry
    };

    res.cookie('userCookie', JSON.stringify(cookieValue), {
      maxAge: sessionTimeout,
      secure: true,
      httpOnly: true
    });
    // console.log('User logged in:', user);
    res.status(201).json({ message: "Authentication successful" , name: user.name,cookie: cookieValue});

  } catch (error) {
    console.log('Error logging in:', error);
    return res.status(500).json({ message: "Error logging in" });
  }
});

app.get('/getOrderedProducts', async (req, res) => {
  try {
    const user_id = getUserId(req);
    const order = await Payment.findOne({ paymentId: req.query.paymentId, user_id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.log('Error getting ordered products:', error);
    res.status(500).json({ message: "Error getting ordered products" });
  }
});

app.get('/getAllOrderedProducts', async (req, res) => {
try{
  const token=req.headers.authorization.split(' ')[1];
  const decodedToken= jwt.verify(token, 'secretKey');
  const user_id=decodedToken.userId;
  // console.log('User id:', user_id);
  const orderedProducts= await Payment.find({user_id});
  if(!orderedProducts){
    console.log('No ordered products found');
    res.status(500).json({message: "No ordered products found"});
  }
  // console.log('Ordered products:', orderedProducts);
  res.status(200).json(orderedProducts);
} catch(err){
   console.log('Error getting all ordered products:', err);
}

});


function verifyToken(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthorized request');
  }

  let token = req.headers.authorization.split(' ')[1];
  if (token === 'null') {
    return res.status(401).send('Unauthorized request');
  }

  try {
    let payload = jwt.verify(token, 'secretKey');
    if (!payload) {
      return res.status(401).send('Unauthorized request');
    }
    next();
  } catch (error) {
    return res.status(401).send('Unauthorized request');
  }
}

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});




