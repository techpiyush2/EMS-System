'use strict'

const { date } = require('joi')
const mongoose = require('mongoose')

const employeeSchema = new mongoose.Schema(
    {
        dateOfJoining: { type: Date },
        dateOfConfirmation: { type: Date },
        skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'skills', default: null }],
        technology: [{ type: mongoose.Schema.Types.ObjectId, ref: 'technologies', default: null }],
        domain: [{ type: mongoose.Schema.Types.ObjectId, ref: 'domains', default: null }],
        probationPeriod: { type: Number, default: 0 },
        document: [
            {
                docType: {
                    type: String,
                    enum: ['AADHAR_CARD', 'PAN_NUMBER', 'PF_NUMBER', 'UAN_NUMBER', 'ESI_NUMBER', ''],
                    default: '',
                },
                file: { type: String, default: null },
                number: { type: String, default: null },
            },
        ],
        status: { type: String, enum: ['ON_PROBATION', 'CONFIRMED'] },
        empType: { type: String, enum: ['PERMANENT', 'CONTRACT', 'TEMPORARY', 'TRAINEE'] },
        allowEmp: { type: Boolean, default: false },
        permanentAddress: {
            line1: { type: String, default: null },
            line2: { type: String, default: null },
            city: { type: String, default: null },
            postalCode: { type: String, default: null },
            state: { type: mongoose.Schema.Types.ObjectId, ref: 'states', default: null },
            country: { type: mongoose.Schema.Types.ObjectId, ref: 'countries', default: null },
        },
        currentAddress: {
            line1: { type: String, default: null },
            line2: { type: String, default: null },
            city: { type: String, default: null },
            postalCode: { type: String, default: null },
            state: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'states',
                default: null,
            },
            country: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'countries',
                default: null,
            },
        },
        sameAs: { type: Boolean, default: false },
        empPolicy: { type: Boolean, default: false },
        salaryDetails: {
            basic: { type: Number, default: 0 },
            hra: { type: Number, default: 0 },
            conveyance: { type: Number, default: 0 },
            da: { type: Number, default: 0 },
            allowance: { type: Number, default: 0 },
            monthlyCtc: { type: Number, default: 0 },
            annualCtc: { type: Number, default: 0 },
            effectiveDate: { type: Date, default: null },
        },
        bankDetails: {
            account: { type: String, default: null },
            number: { type: Number, default: 0 },
            ifscCode: { type: String, default: null },
            branch: { type: String, default: 0 },
        },
        previousExperience: [
            {
                company: { type: String, default: null },
                designation: { type: String, default: null },
                startDate: { type: Date, default: null },
                endDate: { type: Date, default: null },
                Duration: { type: String, default: null },
                reason: { type: String, default: null },
            },
        ],
        educationQualification: [
            {
                course: { type: String, default: null },
                specialization: { type: String, default: null },
                school: { type: String, default: null },
                year: { type: Date, default: 0 },
            },
        ],
        familyDetails: [
            {
                name: { type: String, default: null },
                relation: {
                    type: String,
                    enum: ['MOTHER', 'FATHER', 'SPOUSE', 'CHILD'],
                },
                dob: { type: Date, default: null },
                age: { type: Number, default: 0 },
                mobileNumber: { type: String, default: null },
            },
        ],

        reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
        shift: { type: mongoose.Schema.Types.ObjectId, ref: 'shifts' },
        isDeleted: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        isCompleted : {type : Boolean, default : false},    // by piyush kum
        createdById: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
        },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        nationality: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'nationalities',
            default: null,
        },
        transferTo: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    },
    {
        timestamps: true,
    }
)

var Employee = mongoose.model('employee', employeeSchema)
module.exports = Employee
