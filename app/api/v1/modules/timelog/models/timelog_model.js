'use strict'

const mongoose = require('mongoose')

const timelogSchema = new mongoose.Schema(
    {
        reportedDate: { type: Date, default: null },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        totalHours: { type: String, default: null },
        taskDetail: [
            {
                projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'projects' },
                billable: { type: String, enum: ['BILLABLE', 'FREE'], default: 'FREE' },
                typeOfWork: { type: String, default: null },
                duration: { type: String, default: null },
                moduleName: { type: String, default: null },
                taskDetail: { type: String, default: null },
                status: { type: String, enum: ['OPEN', 'COMPLETED', 'INPROGRESS'], default: 'OPEN' },
            },
        ],
    },
    {
        timestamps: true,
    }
)

var Timelog = mongoose.model('timelog', timelogSchema)
module.exports = Timelog
