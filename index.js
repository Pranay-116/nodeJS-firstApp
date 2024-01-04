const express = require('express');
const path = require('path');

const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

mongoose.connect("mongodb://localhost:27017",{
    dbName: "backend",
})
.then(()=>console.log("Database Connected easily"))
.catch((e)=>console.log(e));

const userSchema = new mongoose.Schema({
    name:String,
    email: String,
    password: String,
})

const User = mongoose.model("User",userSchema);

const app = express();

//Using middleware
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// Setting up View Engine
app.set("view engine", "ejs");

//const users=[];

const isAuthenticated = async (req, res, next) => {
    console.log(req.cookies);
    const { token } = req.cookies;
    if (token) {
      const decoded = jwt.verify(token, "sdjasdbajsdbjasd");
  
      req.user = await User.findById(decoded._id);
  
      next();
    } else {
      res.redirect("/login");
    }
  };

app.get("/",isAuthenticated,(req,res) =>{
    console.log(req.user);
    res.render("logout.ejs",{name:req.user.name});
})

app.get("/login", (req, res) => {
    res.render("login");
  });

app.get("/register", (req, res) => {
    res.render("register");
  });

// app.get("/getProducts",(req,res) =>{
//     res.json({
//         sucess:true,
//         products: [],
//     });
// });

// app.get("/",(req,res) =>{
//     const indexPath = path.join(__dirname,'index.html');
//     res.sendFile(indexPath);
// });
// app.get("/add", async(req,res)=>{
//    await Mssg.create({name: "Abhi",email: "sample@gmail.com"});
//         res.send("Nice");
//     })

// app.post("/contact",async (req,res) =>{
//     // console.log(req.body);
//     // users.push({userName:req.body.name,userEmail: req.body.email})
//    // res.render("success.ejs");
//    await Mssg.create({name:req.body.name,email:req.body.email});
//    res.redirect("/success")

// })

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    let user = await User.findOne({ email });
  
    if (!user) return res.redirect("/register");

    const isMatch =  await bcrypt.compare(password, user.password);

    if(!isMatch)
    return res.render("login.ejs",{message:"Incorrect Password"})

    const token = jwt.sign({ _id: user._id }, "sdjasdbajsdbjasd");

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/");
  });
  
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
  
    let user = await User.findOne({ email });
    if (user) {
      return res.redirect("/login");
    }
    const hashedPassword = await bcrypt.hash(password,10);
    user = await User.create({
        name,
        email,
        password:hashedPassword,
      });
    
      const token = jwt.sign({ _id: user._id }, "sdjasdbajsdbjasd");
    
      res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
      });
      res.redirect("/");
});




app.post("/logout", (req, res) => {
    res.cookie("token", null, {
      httpOnly: true,
      expires: new Date(Date.now()),
    });
    res.redirect("/");
  });

// app.get("/success",(req,res)=>{
//     res.render("success.ejs");
// })



// app.get("/users",(req,res)=>{
//     res.json({users,})
// })

// app.get("/static",(req,res) =>{
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));

// });

// app.get("/register",(req,res) =>{
//   //  console.log(req.user);
//     res.render("register.ejs");
// })
app.listen(5000,()=>{
    console.log('Server is working');
})