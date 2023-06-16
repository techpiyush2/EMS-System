'use strict'

const mongoose = require('mongoose')

const shiftSchema = new mongoose.Schema(
    {
        code: { type: String, default: null },
        name: { type: String, default: null },
        color: { type: String, default: null },
        timeZone: { type: mongoose.Schema.Types.ObjectId, ref: 'timezones' },
        calculateHours: { type: String, enum: ['SESSION_SHIFT', 'START_END_SHIFT'] },
        sessions: {
            first: { inTime: { type: Date }, outTime: { type: Date }, graceIn: { type: Number }, graceOut: { type: Number }, inMargin: { type: Number }, outMargin: { type: Number } },
            second: { inTime: { type: Date }, outTime: { type: Date }, graceIn: { type: Number }, graceOut: { type: Number }, inMargin: { type: Number }, outMargin: { type: Number } },
        }, //Model changed by Gurbhej Sir, 12 Sept,2022 1:12pm because of time calculation.
        fullDay: { type: Number },
        halfDay: { type: Number },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'branches' },
        days: [
            { id: 0, weekDays: [Number], name: { type: String, default: 'Sunday' } },
            { id: 1, weekDays: [Number], name: { type: String, default: 'Monday' } },
            { id: 2, weekDays: [Number], name: { type: String, default: 'Tuesday' } },
            { id: 3, weekDays: [Number], name: { type: String, default: 'Wednesday' } },
            { id: 4, weekDays: [Number], name: { type: String, default: 'Thursday' } },
            { id: 5, weekDays: [Number], name: { type: String, default: 'Friday' } },
            { id: 6, weekDays: [Number], name: { type: String, default: 'Saturday' } },
        ],
    },
    { timestamps: true }
)

const Shift = mongoose.model('shift', shiftSchema)
module.exports = Shift
