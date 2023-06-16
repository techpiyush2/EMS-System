"use strict";

const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
  {
    title: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: "countries" },
  },
  {
    timestamps: true,
  }
);

const State = mongoose.model("state", stateSchema);
module.exports = State;
