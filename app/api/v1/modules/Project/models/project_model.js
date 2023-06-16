const { string } = require('joi')
const mongoose = require('mongoose')
const ProjectSchema = new mongoose.Schema(
    {
        name: { type: String, default: null },
        code: { type: String, default: null },
        description: { type: String, default: null },
        duration: { type: Number, default: 0 },
        domainId: { type: mongoose.Schema.Types.ObjectId, ref: 'domains' },
        startDate: { type: Date },
        endDate: { type: Date },
        projectManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        projectLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'branches' },
        clientName: { type: String, default: null },
        clientCode: { type: String, default: null },
        corporateAddress: { type: String, default: null },
        clientEmail: { type: String, default: null },
        socialMediaId: { type: String, default: null },
        clientPhoneNo: { type: String, default: null },
        projectIncharge: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        status: {
            type: String,
            enum: ['PENDING', 'INPROGRESS', 'OPEN', 'COMPLETED', 'CANCELED', 'DISPUTE'],
        },
        isDeleted: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        technologyId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'technologies' }],
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    },
    {
        timestamps: true,
    }
)

var Project = mongoose.model('Project', ProjectSchema)
module.exports = Project
