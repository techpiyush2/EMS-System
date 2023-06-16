"use strict";

const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model("Document", documentSchema);
module.exports = Document;
