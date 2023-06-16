"use strict";

const mongoose = require("mongoose");

const companyPolicySchema = new mongoose.Schema(
  {
    name: { type: String, default: null },
    code: { type: String, default: null },
    description: { type: String, default: null },
    enforcePolicy: { type: Boolean, default: false },
    file: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    departments: [
      {
        departmentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "departments",
        },
      },
    ],
    designations: [
      {
        designationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "designations",
        },
      },
    ],
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "companies" },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

var companyPolicy = mongoose.model("CompanyPolicy", companyPolicySchema);
module.exports = companyPolicy;
