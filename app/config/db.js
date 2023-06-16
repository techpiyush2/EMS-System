"use strict";
const color = require('colors')
const config = require("./config").get(process.env.NODE_ENV);
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect(config.db.connectionString, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection failed"));
db.once("open", function () {
  console.log("Database connected successfully!".yellow);
});
