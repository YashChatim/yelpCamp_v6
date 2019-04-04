const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local");


// Importing files
var Campground = require("./models/campground.js"); // ./ - references the current directory
var Comment = require("./models/comment.js");
var User = require("./models/user.js");
var seedDB = require("./seeds.js");


mongoose.connect("mongodb://localhost/yelp_camp_v6", { useNewUrlParser: true }); // connected to yelp_camp_v6 database
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public")); // __dirname - directory where script was run
seedDB();


// Passport config
app.use(require("express-session")({
    secret: "Top secret page", // secret - used to encode and decode sessions
    resave: false,
    saveUninitialized: false
}));


// always needed when using passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));

// reading the data from the session, then encoding and decoding the sessions
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    res.locals.currentUser = req.user; // res.locals.currentUser - enables currentUser variable to be used on all templates and routes, req.user - contains logged-in users username and password
    next(); // compulary as it will enable to move to next middleware/route handler
});

// Root route
app.get("/", (req, res) => { // replace function with => arrow function in es6
    res.render("landing.ejs");
});


// INDEX route - show all campgrounds
app.get("/campgrounds", (req, res) => {
    // get all campgrounds from database
    Campground.find({}, (err, allCampgrounds) => { // {} finds everything
        if(err) {
            console.log(err);
        }
        else {
            res.render("campgrounds/index.ejs", {campgrounds: allCampgrounds}); // {campgrounds: allCampgrounds} the contents of allCampgrounds is sent to campgrounds which is furthur used in index.ejs
        }
    });
});


// CREATE route - add to campground to database
app.post("/campgrounds", (req, res) => {
    // getting data from the form and adding to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newCamp = {name: name, image: image, description: description}
    
    // create new campground and save to database
    Campground.create(newCamp, (err, newlyCreated) => {
        if(err) {
            console.log(err);
        }
        else {
            res.redirect("/campgrounds"); // redirecting back to campgrounds page
        }
    });
});


// NEW route - show form to create new campground
app.get("/campgrounds/new", (req, res) => { // campgrounds/new will then send the data to the post route
    res.render("campgrounds/new.ejs");
});


// SHOW route - displays additional info for a specific campground
app.get("/campgrounds/:id", (req, res) => {
    // find campground with given ID
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => { // findById - finds the collection by unique ID, populate - populates the comments field, find the correct data, and stick it in comments array, exec - starts the query
        if(err) {
            console.log(err);
        }
        else {
            console.log(foundCampground);
            res.render("campgrounds/show.ejs", {campground: foundCampground}); // render show.ejs with found Campground
        }
    });
});


// Comments routes

// NEW comment route
app.get("/campgrounds/:id/comments/new", isLoggedIn, (req, res) => {
    // find campground by id
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
        }
        else {
            res.render("comments/new.ejs", {campground: campground});
        }
    });
});


// CREATE comment route
app.post("/campgrounds/:id/comments", isLoggedIn, (req, res) => {
    // lookup campground using id
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        }
        else {
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    console.log(err);
                }
                else {
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});


// Authentication routes

// Sign-up form
app.get("/register", (req, res) => {
    res.render("register.ejs");
});


// Handles user sign-up
app.post("/register", (req, res) => {
    var newUser = new User({username: req.body.username}); // new User - we only pass username and save it in database
    User.register(newUser, req.body.password, (err, user) => { // re.body.password - password is saved as hash in database
        if(err) {
            console.log(err);
            return res.render("register.ejs");
        }
        // else
        passport.authenticate("local")(req, res, function() { // passport.authenticate - logs user in,= and takes care of everthing in session
            res.redirect("/campgrounds");
        });
    });
});


// Login routes

// Login form
app.get("/login", (req, res) => {
    res.render("login.ejs");
});


// Login logic
app.post("/login", passport.authenticate("local", { // middleware - code runs after start of route but before callback function
    successRedirect: "campgrounds", // redirects to /campgrounds if username & password are correct
    failureRedirect: "/login" // redcirects to /login if username & password are incorrect
    }), (req,res) => {
    
});


// Logout route
app.get("/logout", (req, res) => {
    req.logout(); // passport destroys all user data in the session
    res.redirect("/campgrounds");
});


//middleware
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    // else
    res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function(){ // process.env.PORT, process.env.IP  - environmental viriables set up for cloud9 which we access
    console.log("Server started");
});



