"use strict";

const mongoose = require("mongoose");

const rolesSchema = new mongoose.Schema(
  {
    roleTitle: { type: String, default: null },
    roleName: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  {
    timestamps: true,
  }
);

const Roles = mongoose.model("roles", rolesSchema);
module.exports = Roles;
