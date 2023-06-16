const mongoose = require('mongoose')

const branchSchema = new mongoose.Schema(
    {
        branchCode: { type: String, required: true },
        branchName: { type: String, required: true },
        address: { type: String, default: null },
        phone: { type: String, required: true },
        email: { type: String, required: true },
        dateOfFoundation: { type: Date },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        isShift: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
)

var Branch = mongoose.model('branch', branchSchema)
module.exports = Branch
