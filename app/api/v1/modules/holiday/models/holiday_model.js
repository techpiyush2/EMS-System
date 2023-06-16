'use strict'

const mongoose = require('mongoose')

const holidaySchema = new mongoose.Schema(
    {
        name: { type: String, default: null },
        shifts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'shifts' }],
        locations: { type: mongoose.Schema.Types.ObjectId, ref: 'branches' },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        from: { type: Date },
        to: { type: Date },
        description: { type: String, default: null },
        createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    },
    { timestamps: true }
)
const Holiday = mongoose.model('holiday', holidaySchema)
module.exports = Holiday 
