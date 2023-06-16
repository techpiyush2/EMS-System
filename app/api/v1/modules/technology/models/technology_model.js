"use strict";

const mongoose = require("mongoose");

const technologySchema = new mongoose.Schema(
  {
    title: { type: String, default: null },
    description: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },

  },
  {
    timestamps: true,
  }
);

const Technology = mongoose.model("technology", technologySchema);
module.exports = Technology;
