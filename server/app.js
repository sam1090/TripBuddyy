var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var passConfig = require("./passport/config.js");
var routes = require("./routes/index");
var users = require("./routes/users");
//var journey = require('./routes/journey');
var app = express();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
//mongoose local development
mongodb_connection_string = "127.0.0.1:27017";
//take advantage of openshift env vars when available:
if (process.env.MONGO_URI) {
  mongodb_connection_string = process.env.MONGO_URI + "commutr";
  mongoose.connect(mongodb_connection_string, { db: { nativeParser: true } });
} else {
  mongoose.connect(mongodb_connection_string);
}
//Compression
app.use(require("compression")());
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../client")));
app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })

);

app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  //res.redirect('/');
  res.end('Logged in!');
})

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(passConfig.serialize);
passport.deserializeUser(passConfig.deserialize);
passport.use('google', passConfig.googleStrategy);

//Socket IO
var io = require("socket.io")();
app.io = io;
/*
Routes 
*/
app.use("/api/users", users);
app.use("/api", require("./routes/journey")(io));
app.use("/api/chats", require("./routes/chat")(io));
app.use("/api/unreadMessages", require("./routes/unreadMessage")(io));
app.use("/api/notifications", require("./routes/notification")(io));
app.use("/api/vehicles", require("./routes/vehicle"));
app.use("*", routes);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});
// error handlers
// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err,
    });
  });
}
// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {},
  });
});
module.exports = app;
