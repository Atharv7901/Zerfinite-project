const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("./models/user");
const app = express();

//declaration for mongoose
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/zerfinite",{
  useNewUrlParser:true,
  useUnifiedTopology:true
})
.then(() => console.log("Connected to DB!!"))
.catch(error => console.log(error.message));

//some initial declarations
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));

//passport confinguration
app.use(require("express-session")({
  secret: "ZERFINITE",
  resave:false,
  saveUninitialized: false
}));
app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  next();
});
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// getters and post
app.get("/",function(req,res){
  res.render("main");
});


//REGISTER
app.get("/signup",function(req,res){
  res.render("signup");
});
app.post("/signup",function(req,res){
  var newUser = new User({username:req.body.username});
  User.register(newUser,req.body.password,function(err,user){
    if(err){
      console.log(err);
      return res.render("signup");
    }
    passport.authenticate("local")(req,res,function(){
      res.redirect("/afterLogin");
    });
  });
});

//LOGIN
app.get("/login",function(req,res){
  res.render("login");
});
app.post("/login", passport.authenticate("local",{
  successRedirect: "/afterLogin",
  failureRedirect:"/login"
}) ,function(req,res){});

app.get("/afterLogin", isLoggedIn ,function(req,res){
  res.render("afterLogin",{user: req.user});
});


//equipment pages
app.get("/equipments",isLoggedIn,function(req,res){
  res.render("eqipments");
});
//score page
app.get("/scores", isLoggedIn ,function(req,res){
  res.render("score");
});
//highlights page
app.get("/highlights",isLoggedIn ,function(req,res){
  res.render("highlights");
});

//education- courses page
app.get("/courses", isLoggedIn ,function(req,res){
  res.render("courses");
});


app.get("/forgot", function(req,res){
  res.render("forgot");
});


app.get("/movies", isLoggedIn, function(req,res){
  res.render("entertainment_movies");
});

app.get("/ott", isLoggedIn, function(req,res){
  res.render("entertainment_ott");
});


app.get("/gaming", isLoggedIn, function(req,res){
  res.render("entertainment_gaming");
});

app.get("/books", isLoggedIn, function(req,res){
  res.render("education_books");
});

app.get("/youtube", isLoggedIn, function(req,res){
  res.render("education_youtube");
});

//LOGOUT
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});

//to check if logged in or not
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}




app.listen(3000, function(err){
  console.log("Server started at port 3000 -->");
});
