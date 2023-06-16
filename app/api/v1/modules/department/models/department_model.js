const mongoose = require('mongoose')

const departmentSchema = new mongoose.Schema(
    {
        departmentCode: { type: String, default: null },
        title: { type: String, default: null },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    },
    {
        timestamps: true,
    }
)

var Department = mongoose.model('department', departmentSchema)
module.exports = Department
