'use strict'

const mongoose = require('mongoose')
const rolesandpermissionsSchema = new mongoose.Schema(
    {
        title: { type: String, default: null },
        permissions: [
            {
                model: { type: String, default: null },
                crud: {
                    heading: { type: String, default: null },
                    action: [{ type: String, enum: ['VIEW', 'ADD', ''], default: '' }],
                },
            },
        ],
        createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
)

const RolesAndPermissionsSchema = mongoose.model('rolesandpermissionsSchema', rolesandpermissionsSchema)
module.exports = RolesAndPermissionsSchema
