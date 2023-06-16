"use strict";

const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    title: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  {
    timestamps: true,
  }
);

const Skill = mongoose.model("skill", skillSchema);
module.exports = Skill;
