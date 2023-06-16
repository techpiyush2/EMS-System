"use strict";

const mongoose = require("mongoose");

const userAuthSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    loginTime: { type: Date, default: null },
    logoutTime: { type: Date, default: null },
    token: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

var User = mongoose.model("userAuth", userAuthSchema);
module.exports = User;
