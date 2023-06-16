"use strict";

const mongoose = require("mongoose");
const shortid = require("shortid");

const companySchema = new mongoose.Schema(
  {
    logo: { type: String, default: null },
    companyName: { type: String, default: null },
    headOfficeAdd: { type: String, default: null },
    mobileNumber: { type: String, default: null },
    email: { type: String, default: null },
    website: { type: String, default: null },
    dateOfFoundation: { type: Date, default: null },
    multipleLocation: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    gst: { type: String, default: null },
    esi: { type: String, default: null },
    pan: { type: String, default: null },
    tan: { type: String, default: null },
    progressBarLength: { type: Boolean, default: false },
    percentageData: { type: Number, default: 0 },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

var Company = mongoose.model("company", companySchema);
module.exports = Company;
