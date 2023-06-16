'use strict'

const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema(
    {
        // model changed by Gurbhej sir on 19 Sept,2022
        date: { type: Date },
        empId: { type: String, default: null },
        inTime: { type: Date, default: null },
        outTime: { type: Date, default: null },
        workStatus: { type: String, default: null },
        createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'shifts' },
        branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'branches' },
        workHrs: { type: Number, default: 0 },
        otHrs: { type: Object, default: null },
        shortfallHours: { type: Number, default: 0},
        diff: { type: String, enum: ['excess', 'shortFall'] },
        // calculatedWorkHours: { type: Number, default: 0.0 },
        // shiftHrs: { type: Number, default: 0.0 },
        // shiftOutTime: { type: Number, default: 0.0 },
        // graceIn: { type: Number, default: 0.0 },
        // graceOut: { type: Number, default: 0.0 },
        // calculatedWorkHoursafterGrace: { type: Number, default: 0.0 },
        // shortfallGraceHours: { type: Number, default: 0.0 },
        // inMargin: { type: Number, default: 0.0 },
        // outMargin: { type: Number, default: 0.0 },
        // graceInTime: { type: Number, default: 0.0 },
        // graceOutTime: { type: Number, default: 0.0 },
        // inMarginTime: { type: Number, default: 0.0 },
        // outMarginTime: { type: Number, default: 0.0 },
        // calculatedMarginTime: { type: Number, default: 0.0 },
    },
    { timestamps: true }
)

const Attendance = mongoose.model('attendance', attendanceSchema)
module.exports = Attendance
// "name": "Dussehra",
//             "shifts": [
//                 "632159bfdb306f210a6bbd1d"
//             ],
//             "isActive": true,
//             "from": "2022-09-25T18:30:00.000Z",
//             "to": "2022-09-29T18:30:00.000Z",
//             "locationsInfo": {
//                 "_id": "630cae8643e64076e7d93214",
//                 "address": "Sahibzada Ajit Singh Nagar, Punjab, India",
//                 "branchCode": "1",
//                 "branchName": "Dell Mohali"
//             },
//             "shiftName": [
//                 {
//                     "_id": "632159bfdb306f210a6bbd1d",
//                     "name": "Morning Shift"