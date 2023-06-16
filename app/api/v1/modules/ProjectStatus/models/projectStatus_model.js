const { string } = require('joi')
const mongoose = require('mongoose')
const ProjectStatusSchema = new mongoose.Schema(
    {
        status: { type: String, default: null },
        isDeleted: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        statusType: { type: String, enum: ['PROJECTSTATUS', 'BUGREPORTSTATUS'], default: 'PROJECTSTATUS' },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    },
    {
        timestamps: true,
    }
)

var ProjectStatus = mongoose.model('ProjectStatus', ProjectStatusSchema)
module.exports = ProjectStatus
