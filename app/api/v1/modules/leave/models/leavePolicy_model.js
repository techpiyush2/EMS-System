'use strict'

const mongoose = require('mongoose')

const leavePolicySchema = new mongoose.Schema(
    {
        name: { type: String, default: null },
        code: { type: String, default: null },
        color: { type: String, default: null },
        type: { type: String, enum: ['PAID', 'UNPAID', 'HOLIDAY'] },
        basedOn: { type: String, enum: ['FIXED_ENTITLEMENT', 'LEAVE_GRANT'] },
        unit: [{ type: String, enum: ['FULL_DAY', 'HALF_DAY'] }],
        description: { type: String, default: null },
        maxRequestNo: { value: { type: Number, default: 0 }, unit: { type: String, enum: ['YEAR', 'MONTH'], default: 'YEAR' } },
        leaveGrant: { maxLimit: { type: Number, default: 0 }, leaveValidity: { value: { type: Number, default: 0 }, unit: { type: String, enum: ['YEAR', 'MONTH'], default: 'YEAR' } } },
        entitleMent: {
            entitled: { type: Number, default: 0 },
            effectiveAfter: { value: { type: Number, default: 0 }, unit: { type: String, enum: ['YEAR', 'MONTH'], default: 'YEAR' }, from: { type: String, enum: ['CONFIRMATION_DATE', 'JOINING_DATE'] } },
            accural: { date: { type: Number, default: 0 }, month: { type: Number }, checked: { type: Boolean, default: false }, unit: { type: String, enum: ['MONTH', 'YEAR'], default: 'YEAR' } },
            reset: { date: { type: Number, default: 0 }, month: { type: Number }, checked: { type: Boolean, default: false }, unit: { type: String, enum: ['MONTH', 'YEAR'], default: 'YEAR' }, carryForward: { type: Number, default: 0 } },
            prorateAccrual: { type: Boolean, default: false },
        },
        applicable: {
            gender: [{ type: String, enum: ['MALE', 'FEMALE', 'OTHERS'] }],
            maritalStatus: [{ type: String, enum: ['SINGLE', 'MARRIED'] }],
            location: [{ locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'branches' } }],
            empType: [{ empName: { type: String, enum: ['PERMANENT', 'CONTRACT', 'TEMPORARY', 'TRAINEE'] } }],
            departments: [{ departmentsId: { type: mongoose.Schema.Types.ObjectId, ref: 'department' } }],
        },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        isSandwich: { type: String, enum: ['isSandwichYes', 'isSandwichNO'] },
        isIncludeHoliday: [{ type: String, enum: ['INCLUDE_ WEEKENDS', 'INCLUDE_HOLIDAYS', ''], default: '' }],
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    },
    { timestamps: true }
)

var LeavePolicy = mongoose.model('leavePolicy', leavePolicySchema)
module.exports = LeavePolicy
