const mongoose = require("mongoose");

const timezoneSchema = new mongoose.Schema(
  {
    code: { type: String, default: null },
    name: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

var Timezone = mongoose.model("timezone", timezoneSchema);
module.exports = Timezone;
