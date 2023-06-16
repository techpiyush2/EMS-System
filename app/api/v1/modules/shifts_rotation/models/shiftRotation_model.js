"use strict";

const mongoose = require("mongoose");

const shiftRotationSchema = new mongoose.Schema(
  {
    name: { type: String, default: null },
    frequency: {
      // daily: { type: String, default: null },
      // weekly: {
      //   type: String,
      //   enum: [
      //     "MONDAY",
      //     "TUESDAY",
      //     "WEDNESDAY",
      //     "THURSDAY",
      //     "FRIDAY",
      //     "SATURDAY",
      //     "SUNDAY",
      //   ],
      // },
      // monthly: { type: Number, default: 0 },
      type: { type: String, enum: ["DAILY", "WEEKLY", "MONTHLY"] },
      value: { type: Number, default: 0 },
    },
    locations: { type: mongoose.Schema.Types.ObjectId, ref: "branches" },
    rotation: {
      from: { type: mongoose.Schema.Types.ObjectId, ref: "shifts" },
      to: { type: mongoose.Schema.Types.ObjectId, ref: "shifts" },
    },
    applicablePeriod: { from: { type: Date }, to: { type: Date } },
    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: "departments" }],
    designations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "designations",
      },
    ],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

const ShiftRotation = mongoose.model("shiftRotation", shiftRotationSchema);
module.exports = ShiftRotation;
