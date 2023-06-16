'use strict'

const { string } = require('joi')
const mongoose = require('mongoose')

const leaveApplySchema = new mongoose.Schema(
    {
        isApproved: {
            type: String,
            enum: ['APPROVED', 'PENDING', 'DECLINED', 'WITHDRAW'],
            default: 'PENDING',
        },
        leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'leavepolicies' },
        startDate: { type: Date },
        endDate: { type: Date },
        session: { type: String, default: null },
        reason: { type: String, default: null },
        createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        appliedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null }], //Model changed by Gurbhej Sir, 31 Aug,2022 12:00 because data has not segregated.
        branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'branches' },
        noOfLeaves: { type: Number, default: 0 },
        leaveDetails: [
            {
                leaveDate: { type: Date, default: null },
                dayName: { type: String, default: null },
            },
        ],
    },

    { timestamps: true }
)

var LeaveApply = mongoose.model('leaveApply', leaveApplySchema)
module.exports = LeaveApply
