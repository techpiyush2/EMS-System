"use strict";

const mongoose = require("mongoose");

const attendanceRegularizedSchema = new mongoose.Schema(
  {
    regularizedIn: { type: Object },
    regularizedOut: { type: Object },
    regularizedReason: { type: String, default: null },
    regularizedNote: { type: String, default: null },
    empId: { type: String, default: null },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    attendanceId: { type: mongoose.Schema.Types.ObjectId, ref: "attendance" },
    status: {
      type: String,
      enum: ["ACCEPT", "DECLINED", "PENDING"],
      default: "PENDING",
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

var AttendanceRegularized = mongoose.model(
  "attendanceRegularized",
  attendanceRegularizedSchema
);
module.exports = AttendanceRegularized;
