'use strict'

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 10

const userLeaveHistorySchema = new mongoose.Schema(
    {
        empId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            default: null,
        },
        balanceLeave: [
            {
                leaveType: { type: String, default: null },
                pendingLeaves: { type: Number },
            },
        ],
    },
    {
        timestamps: true,
    }
)

var UserLeaveHistory = mongoose.model('userLeaveHistory', userLeaveHistorySchema)
module.exports = UserLeaveHistory
