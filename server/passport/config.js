var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20").Strategy;
var User = require("../models/user");

module.exports = {
  deserialize: function (id, done) {
    User.findOne(
      {
        _id: id,
      },
      function (err, user) {
        done(err, user);
      }
    );
  },
  serialize: function (user, done) {
    done(null, user._id);
  },
  googleStrategy: new GoogleStrategy(
    {
      name: "google", // Assign a name to the strategy
      clientID: "460244191654-83n6mnd3dfs9ec5e2jhsqn1gis8fs5f3.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:3000/google/callback",
      profileFields: [
        "id",
        "displayName",
        "picture",
        "emails",
        "gender",
        "about",
        "bio",
      ],
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOne({ id: profile.id }, function (err, user) {
        if (err) {
          return cb(err);
        }

        if (user) {
          var sendUser = {
            type: "Old user",
            user: user,
          };
          return cb(null, sendUser);
        }

        var newUser = new User();
        newUser.id = profile.id;
        newUser.name = profile.displayName;
        newUser.gender = profile.gender;
        newUser.profile_pic = profile.photos[0].value;
        newUser.save(function (err, user) {
          if (err || !user) {
            console.log(err);
            return cb(err);
          }

          var sendUser = {
            type: "New user",
            user: user,
          };
          return cb(null, sendUser);
        });
      });
    }
  ),
};
