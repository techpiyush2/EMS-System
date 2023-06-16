"use strict";
var jwt = require("jsonwebtoken"),
  constant = require("./constants"),
  mongoose = require("mongoose"),
  User = mongoose.model("user");
// UrlPermission = mongoose.model('assignPermissions'),
// Token = mongoose.model('token'),
// Role = mongoose.model('role');
var allowed = [
  "/user/userRegister",
  "/user/verifyAccount",
  "/user/userLogin",
  "/user/forgotPassword",
  "/user/resetPassword",
  "/user/getUserDetail",
];

module.exports = {
  ensureAuthorized: ensureAuthorized,
};

function ensureAuthorized(req, res, next) {
  var unauthorizedJson = { code: 401, message: "Unauthorized", data: {} };
  var token = req.headers["authorization"] || req.query["api_key"];
  var forbidden = {
    code: 403,
    message: " trying to access something you dont have the permission to",
  };

  var available = false;
  for (var i = 0; i < allowed.length; i++) {
    if (allowed[i] == req.baseUrl || allowed[i] == req.path) {
      available = true;
      break;
    }
  }
  if (!available) {
    if (req.headers.authorization) {
      if (typeof token !== "undefined") {
        var str = req.url ? req.url : req.path;

        let count = (str.match(new RegExp("/", "g")) || []).length;
        var url;
        if (count != 2) {
          url = str.substring(0, str.lastIndexOf("/"));
        } else {
          url = str;
        }

        var condition = {
          url: { $regex: url, $options: "gi" },
          is_deleted: false,
        };
        var splitToken = token.split(" ");
        try {
          token = splitToken[1];
          var decoded = jwt.verify(token, constant.cryptoConfig.secret);
          if (splitToken[0] == "admin_bearer") {
            req.user = decoded;
            User.findOne({ deleted: false }, "email").exec(function (
              err,
              user
            ) {
              if (err || !user) {
                res.json(unauthorizedJson);
              } else {
                req.user = user;
                next();
              }
            });
          } else if (splitToken[0] == "Bearer") {
            Token.findOne({ token: token })
              .lean()
              .exec(function (err, tokenResult) {
                if (tokenResult) {
                  User.findOne(
                    { _id: tokenResult.user_id, deleted: false },
                    { role_id: 1, email: 1, userType: 1 }
                  )
                    .lean()
                    .exec(function (err, user) {
                      if (err || !user) {
                        res.json(unauthorizedJson);
                      } else {
                        if (user && user.userType && user.userType != "admin") {
                          if (user && user.userType == "user") {
                            user.role_id = "5be1824dd0cb9764d2ee4729";
                          }
                          if (user && user.userType == "clinic") {
                            user.role_id = "5bec1889b4eebdbba5657af3";
                          } //remove this code before live
                          // Role.findOne({ _id: user.role_id }).lean().exec((err, role) => {
                          //     if (err) {
                          //         res.json(forbidden);
                          //     } else {
                          //         UrlPermission.findOne(condition).exec((err, result) => {
                          //             if (result && role && result.label && result.action) {
                          //                 let checkObj = role[result.label];
                          //                 if (checkObj && checkObj[result.action]) {
                          //                     req.user = user;
                          //                     next();
                          //                 } else {
                          //                     res.json();
                          //                 }
                          //             } else {

                          //                 res.json(forbidden);
                          //             }
                          //         })
                          //     }
                          // })
                        } else {
                          if (user.userType == "admin") {
                            req.user = user;
                            next();
                          } else {
                            res.json(unauthorizedJson);
                          }
                        }
                      }
                    });
                } else {
                  res.json(unauthorizedJson);
                }
              });
          } else {
            res.json(unauthorizedJson);
          }
        } catch (err) {
          res.json(unauthorizedJson);
        }
      } else {
        res.json(unauthorizedJson);
      }
    } else {
      next();
    }
  }
}
