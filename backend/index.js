


const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { type } = require("os");
const { request } = require("http");

//middleware 
app.use(express.json())

app.use(express.json());
app.use(cors());

// database connection with mongodb
mongoose.connect("mongodb+srv://ravishrandev:v0IBGEWuxaBoR8YK@cluster0.meaunkp.mongodb.net/e-commerce");

//API creation

app.get("/",(req,res)=>{
    res.send("Express app is running")
})



app.post("/addproduct", async (req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length>0) {
      let last_product_array = products.slice(-1);
      let last_product = last_product_array[0];
      id = last_product.id+1;
    }
    else
    { id = 1; }
    const product = new Product({
      id: id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({success:true,name:req.body.name})
  });

//creating API for deleting product

app.post('/removeproduct', async (req, res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name
    })
})


//creating api for getting all products
app.get('/allproducts', async (req, res)=>{
    let products = await Product.find({});
    console.log("All products fetched");
    res.send(products);

})

//schema creation for user model

const Users = mongoose.model('Users', {
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now

    }

})

//creating endpoint for registering user
app.post('/signup', async (req, res) => {
    console.log("Sign Up");
          let success = false;
          let check = await Users.findOne({ email: req.body.email });
          if (check) {
              return res.status(400).json({ success: success, errors: "existing user found with this email" });
          }
          let cart = {};
            for (let i = 0; i < 300; i++) {
            cart[i] = 0;
          }
          const user = new Users({
              name: req.body.username,
              email: req.body.email,
              password: req.body.password,
              cartData: cart,
          });
          await user.save();
          const data = {
              user: {
                  id: user.id
              }
          }
          
          const token = jwt.sign(data, 'secret_ecom');
          success = true; 
          res.json({ success, token })
})

//creating endpoint for user login
app.post('/login', async(req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user:{
                    id:user.id
                }
            }

            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true, token});
        }
        else{
            res.json({success:false, errors:"wrong password"});
        }

    }
    else{
        res.json({success:false, errors:"wrong email id"});
    }
})
    

//creating endpoint for newcollection data
app.get('/newcollection', async (req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newcollection);
    
})

//creating endpoint for popular in women section
app.get('/popularinwomen', async (req,res)=>{
    let products = await Product.find({category:"women"});
    let popular_in_woman = products.slice(0,4);
    console.log("Popular in women collection Fetched");
    res.send(popular_in_woman);
    
})

//creating middleware to fetch user
const fetchUser = async (req,res,next)=>{
    const token = req.header('auth-token');
    if (!token){
        res.status(401).send({errors:"Please authenticate using valid token"})
    }
    else
    {
        try{
            const data = jwt.verify(token,'secret_ecom');
            req.user= data.user;
            next();
        }
        catch (error) {
        res.status(401).send({errors:"please authenticate using a valid token"})

    }

}}


//creating endpoint for adding product to cartdata
app.post('/addtocart',fetchUser, async(req,res)=>{

    try {
        let userData = await Users.findOne({_id: req.user.id});
        console.log("added", req.body.itemId);
        
        // Initialize cartData if it doesn't exist
        if (!userData.cartData) {
            userData.cartData = {};
        }
        
        // Initialize the item count if it doesn't exist
        if (!userData.cartData[req.body.itemId] === undefined) {
            userData.cartData[req.body.itemId] = 0;
        }
        
        userData.cartData[req.body.itemId] += 1;
        
        await Users.findOneAndUpdate(
            {_id: req.user.id},
            {cartData: userData.cartData}  // Changed from userData.cart to userData.cartData
        );
        
        res.json({ message: "Added", cartData: userData.cartData }); // Send JSON response
    } catch (error) {
        console.error("Error in /addtocart:", error);
        res.status(500).json({ error: "Internal server error" });
    }


    
    /*let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cart});
    res.json({ message: "Added", cartData: userData.cartData });
    /*
    try {
        console.log("Received request to /addtocart");
        console.log(req.body,req.user);
        res.json({ message: "Item added to cart", data: req.body });
    } catch (error) {
        console.error("Error in /addtocart:", error);
        res.status(500).json({ error: "Internal server error" });
    }
    */


});


//creating endpoint to remove product from cartdata
app.post('/removefromcart',fetchUser, async(req,res)=>{
    console.log("removed", req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    if (userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData: userData.cartData});
    res.send("Removed")

})

//creating endpoint to get cardata
app.post('/getcart',fetchUser,async (req,res)=>{
    console.log("GetCart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);

})

app.listen(port, (error) => {
    if (!error) console.log("Server Running on port " + port);
    else console.log("Error at ma face : ", error);
  });


// Image storage engline

const storage = multer.diskStorage({
    destination: './upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname )}`)
    }
})

//schema for creating products

const Product = mongoose.model("Product", {
    id:{
        type: Number,
        required: true,

    },
    name:{
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true,

    },
    category:{
        type: String,
        required: true,
    },
    new_price:{
        type: Number,
        required: true,
    },
    old_price:{
        type: Number,
        required: true,
    },
    date:{
        type: Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,
    },
})

const upload = multer({storage:storage})

//creating uploadf endpoint for images
app.use('/images', express.static('upload/images'))

app.post("/upload", upload.single('product'),(req,res)=>{
    res.json({
        sucess:1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    })
})

