const mongoose = require("mongoose");

const designationSchema = new mongoose.Schema(
  {
    designationCode: { type: String, default: null },
    title: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "departments" },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  {
    timestamps: true,
  }
);

var Designation = mongoose.model("designation", designationSchema);
module.exports = Designation;
