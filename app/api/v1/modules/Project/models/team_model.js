const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "projects" },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    inTeam : { type : Boolean , default : true }
  },
  {
    timestamps: true,
});

var Team = mongoose.model("Team", TeamSchema);
module.exports = Team;
