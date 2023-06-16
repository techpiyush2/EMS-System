'use strict'

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 10

const userSchema = new mongoose.Schema(
    {
        corporateId: { type: String, default: null },
        image: { type: String, default: null },
        empId: { type: String, default: null },
        firstName: { type: String, default: null },
        middleName: { type: String, default: null },
        lastName: { type: String, default: null },
        age: { type: Number, default: 0 },
        spouse: { type: String, default: null },
        fatherName: { type: String, default: null },
        email: { type: String, lowercase: true },
        gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', ''],
            default: '',
        },
        maritalStatus: {
            type: String,
            enum: ['MARRIED', 'SINGLE', 'WIDOWED', 'DIVORCE', 'SEPARATED'],
        },
        isAdminApproved: {
            type: String,
            enum: ['APPROVED', 'PENDING', 'DECLINED'],
            default: 'PENDING',
        },
        dob: { type: Date, default: null },
        isAccepted: {
            type: String,
            enum: ['PENDING', 'ACCEPT', 'DECLINED'],
            default: 'PENDING', 
        },
        password: { type: String, default: null },
        mobileNumber: { type: String, default: null },
        isDeleted: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },

        address: { type: String, default: null },
        address1: { type: String, default: null },
        city: { type: String, default: null },
        postalCode: { type: String, default: null },
        resetKey: { type: String, default: null },
        createdById: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            default: null,
        },
        isCompleted: { type: Boolean, default: false },
        percentageData: { type: Number, default: 0 },
        invitedById: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        department: { type: mongoose.Schema.Types.ObjectId, ref: 'department', default: null },
        designation: { type: mongoose.Schema.Types.ObjectId, ref: 'designation', default: null },
        domainId: { type: mongoose.Schema.Types.ObjectId, ref: 'domains' },
        branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'branch' },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
        state: { type: mongoose.Schema.Types.ObjectId, ref: 'states', default: null },
        country: { type: mongoose.Schema.Types.ObjectId, ref: 'countries', default: null },
        roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'roles' },
        isAddDepartment: { type: Boolean, default: false },
        isAddDesignation: { type: Boolean, default: false },
        isAddBranch: { type: Boolean, default: false },
        isAddSkill: { type: Boolean, default: false },
        isAddTechnology: { type: Boolean, default: false },
        isAddShift: { type: Boolean, default: false },
        isAddHardware: { type: Boolean, default: false },
        isAddEmployee: { type: Boolean, default: false },
        isAddDomain: { type: Boolean, default: false },
        isAddLeave: { type: Boolean, default: false },
        isAddPolicy: { type: Boolean, default: false },
        empAttendanceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
        },
        reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    },
    {
        timestamps: true,
    }
)
userSchema.pre('save', function (next) {
    var user = this
    if (!user.isModified('password')) return next()
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err)
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err)
            user.password = hash
            next()
        })
    })
})

userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err)
        cb(null, isMatch)
    })
}

var User = mongoose.model('user', userSchema)
module.exports = User
