'use strict'

const mongoose = require('mongoose')

const hardwareSchema = new mongoose.Schema(
    {
        systemNumber: { type: String, default: null },
        typeOfSystem: { type: String, default: null },
        brand: { type: String, default: null },
        operatingSystem: { type: String, enum: ['UBUNTU', 'WINDOWS', 'IOS'] },
        processor: { type: String, default: null },
        generation: { type: Number, default: 0 },
        processorGHZ: { type: Number, default: 0 },
        ramSize: { type: Number, default: 0 },
        numOfRam: { type: Number, default: 0 },
        ssd: {
            value: { type: Number, default: 0 },
            unit: { type: String, enum: ['GB', 'TB', 'MB', ''], default: 'GB' },
        },
        externalHardDisk: {
            value: { type: Number, default: 0 },
            unit: { type: String, enum: ['GB', 'TB', 'MB', ''], default: 'GB' },
        },
        cardName: { type: String, default: null },
        cardSize: { type: Number, default: 0 },

        companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        isDeleted: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
)
var Hardware = mongoose.model('hardware', hardwareSchema)
module.exports = Hardware
