var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// Router Objects
var indexRouter = require("./routes/index");
var projectsRouter = require("./routes/projects");
var coursesRouter = require("./routes/courses");

// Import MongoDB and Configuration modules
var mongoose = require("mongoose");
var configs = require("./configs/globals");

// HBS Helper Methods
var hbs = require("hbs");

// Import passport and session modules
var passport = require('passport');
var session = require('express-session');

// Import user model
var User = require('./models/user');

// Import Google Strategy
var GoogleStrategy = require("passport-google-oauth20").Strategy;

// Express App Object
var app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// Express Configuration
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Configure passport module
app.use(session({
  secret: 's2021pr0j3ctTracker', // Secret key for session encryption
  resave: false, // Avoid resaving the session if it's not modified
  saveUninitialized: true, // Save the session even if it's not initialized
  cookie: { secure: false } // Set to 'true' in production if using HTTPS
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Link passport to the user model
passport.use(User.createStrategy());

// Configure Google strategy
passport.use(new GoogleStrategy(
  {
    clientID: configs.Authentication.Google.ClientId,
    clientSecret: configs.Authentication.Google.ClientSecret,
    callbackURL: configs.Authentication.Google.CallbackUrl
  },
  async (accessToken, refreshToken, profile, done) => {
    // Search user by Google ID
    const user = await User.findOne({ oauthId: profile.id });
    // If user exists, return the existing user
    if (user) {
      return done(null, user);
    } else {
      // New user, register in the database
      const newUser = new User({
        username: profile.displayName,
        oauthId: profile.id,
        oauthProvider: 'Google',
        created: Date.now()
      });
      // Save the new user to the database
      const savedUser = await newUser.save();
      return done(null, savedUser);
    }
  }
));

// Set passport to write/read user data to/from session object
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routing Configuration
app.use("/", indexRouter);
app.use("/projects", projectsRouter);
app.use('/courses', coursesRouter);

// Connecting to the MongoDB Database
mongoose
  .connect(configs.ConnectionStrings.MongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((message) => console.log("Connected Successfully!"))
  .catch((error) => console.log(`Error while connecting: ${error}`));

// Sub-Expressions HBS Helper Methods
hbs.registerHelper("createOptionElement", (currentValue, selectedValue) => {
  var selectedProperty = "";
  if (currentValue == selectedValue.toString()) {
    selectedProperty = "selected";
  }
  return new hbs.SafeString(
    `<option ${selectedProperty}>${currentValue}</option>`
  );
});

hbs.registerHelper('toShortDate', (longDateValue) => {
  return new hbs.SafeString(longDateValue.toLocaleDateString('en-CA'));
});

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
