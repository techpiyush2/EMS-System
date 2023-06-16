'use strict'

const catchAsync = require('../../../../../lib/catchAsync'),
    Response = require('../../../../../../app/lib/response'),
    constants = require('../../../../../../app/lib/constants'),
    query = require('../../../../../../app/lib/common_query'),
    toggleStatus = require('./../../factory/changeStatus'),
    { employeeValidation, empDetailsValidation, employeeUpdateValidation } = require('./../../../../../lib/joiValidation'),
    softDelete = require('./../../factory/softDelete'),
    utility = require('./../../../../../lib/utility'),
    mailer = require('./../../../../../lib/mailer'),
    update = require('./../../factory/update'),
    mongoose = require('mongoose'),
    User = require('../../user/models/user_model'),
    Employee = require('../models/empPersonalDetail_model'),
    UserLeaveHistory = require('../../user/models/userLeaveHistory'),
    LeavePolicy = require('../../leave/models/leavePolicy_model'),
    shortid = require('shortid'),
    userAuth = require('../../user/models/user_auth'),
    uuid = require('uuid'),
    fs = require('fs'),
    jwt = require('jsonwebtoken'),
    config = require('../../../../../config/config').get(process.env.NODE_ENV)
const { date } = require('joi')
const bcrypt = require('bcrypt')
const Department = require('../../department/models/department_model')
const Companypolicy = require('../../company Policy/models/companyPolicy_model')

exports.employeeAdd = catchAsync(async (req, res) => {
    let resetKey = utility.uuid.v1()
    let insertObj = {
        firstName: req.body.firstName,
        email: req.body.email,
        createdById: req.body.createdById,
        mobileNumber: req.body.mobileNumber,
        dob: req.body.dob,
        age: req.body.age,
        gender: req.body.gender,
        fatherName: req.body.fatherName,
        // companyId: req.body.companyId,
        resetKey: resetKey,
    }

    let empDetail = {
        dateOfJoining: req.body.dateOfJoining,
        dateOfConfirmation: req.body.dateOfConfirmation,
        probationPeriod: req.body.probationPeriod ? req.body.probationPeriod : 0,
        status: req.body.status,
        empType: req.body.empType,
    }

    await employeeValidation.validateAsync(insertObj)

    // const userRes = await User.findOne({
    //     email: req.body.email,
    //     companyId: req.body.companyId,
    //     createdById: req.body.createdById,
    // })

    // if (userRes) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))

    const { roleId, department, designation, branchId, companyId, bloodGroup, middleName, lastName, spouse, empId, reportingManager, progressBarLength, percentageData, corporateId } = req.body

    if (!roleId) return res.json(Response(constants.statusCode.unauth, constants.messages.roleId))
    if (!department) return res.json(Response(constants.statusCode.unauth, constants.departmentMsg.departmentIdReq))
    if (!designation) return res.json(Response(constants.statusCode.unauth, constants.designationMsg.idReq))
    if (!branchId) return res.json(Response(constants.statusCode.unauth, constants.messages.branchId))
    if (!companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))
    insertObj.roleId = roleId
    insertObj.department = department
    insertObj.designation = designation
    insertObj.branchId = branchId
    insertObj.companyId = companyId
    insertObj.bloodGroup = bloodGroup
    insertObj.middleName = middleName
    insertObj.lastName = lastName
    insertObj.spouse = spouse
    insertObj.empId = empId
    insertObj.corporateId = corporateId
    insertObj.progressBarLength = progressBarLength
    insertObj.percentageData = percentageData

    if (reportingManager != '') insertObj.reportingManager = reportingManager

    await empDetailsValidation.validateAsync(empDetail)

    const userResult = await User.create(insertObj)
    // console.log('userResult=============', userResult)

    const { userId } = req.body

    let updatePercentage = await User.findByIdAndUpdate({ _id: userId }, { isAddEmployee: true, percentageData: req.body.percentageData })
    const { shift, nationality, allowEmp, sameAs, document, salaryDetails, bankDetails, permanentAddress, currentAddress, skills, domain, technology } = req.body
    empDetail.createdById = userResult._id
    empDetail.companyId = userResult.companyId
    empDetail.shift = shift
    empDetail.nationality = nationality
    empDetail.document = document
    empDetail.allowEmp = allowEmp
    empDetail.sameAs = sameAs
    empDetail.salaryDetails = salaryDetails
    empDetail.bankDetails = bankDetails
    empDetail.permanentAddress = permanentAddress
    empDetail.currentAddress = currentAddress
    empDetail.skills = skills
    empDetail.domain = domain
    empDetail.technology = technology
    if (reportingManager != '') empDetail.reportingManager = reportingManager

    // console.log('empDetail============1==========', empDetail)
    // if (req.body.allowEmp == true) {
    //     empDetail.currentAddress = {}
    //     empDetail.permanentAddress = {}
    //     // empDetail.nationality = {}
    //     // insertObj.bloodGroup = {}
    // }
    // console.log('empDetail============2==========', empDetail)
    console.log('====================')
    const empResult = await Employee.create(empDetail)
    // console.log('empResult==========', empResult)
    // return false
    // const { userId } = req.body

    // let updatePercentage = await User.findByIdAndUpdate({ _id: userId }, { percentageData: req.body.percentageData })

    const printContents = {
        userId: userResult._id,
        email: userResult.email,
        firstName: userResult.firstName,
        middleName: userResult.middleName,
        lastName: userResult.lastName,
        empId: userResult.empId,
        corporateId: userResult.corporateId,
        acceptLink: config.frontEndURL + 'ResetPassword/' + resetKey,
        declineLink: config.frontEndURL + 'Decline/' + insertObj.resetKey,
    }
    const options = {
        to: userResult.email,
        subject: constants.email.invitationTitle,
    }

    const mailResponse = await mailer.inviteEmployee(options, printContents)
    if (!userResult || !empResult || !mailResponse) return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
    else {
        return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
    }
})
exports.isExistEmployee = catchAsync(async (req, res) => {
    const userRes = await User.findOne({
        email: req.body.email,
        companyId: req.body.companyId,
        createdById: req.body.createdById,
    })

    if (userRes) return res.json(Response(constants.statusCode.unauth, constants.messages.empExist))
    else return res.json(Response(constants.statusCode.ok, constants.messages.notExist))
})
exports.empList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 10
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)

    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { firstName: 1 }
    }
    let child_condition = {}
    let condition = { isActive: true }
    if (req.body.isActive != '' && req.body.isActive != undefined) {
        condition.isActive = req.body.isActive == 'true' ? true : false
    }
    const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')
    if (req.body.searchText) {
        child_condition.$or = [{ firstName: new RegExp(searchText, 'gi') }]
    }

    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)

    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }

    const data = await Employee.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'users',
                let: { user_id: '$createdById'},
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$user_id'] } } }],
                as: 'usersInfo',
            },
        },
        { $unwind: { path: '$usersInfo', preserveNullAndEmptyArrays: true } },

        {
            $project: {
                empId: '$usersInfo.empId',
                firstName: '$usersInfo.firstName',
                mobileNumber: '$usersInfo.mobileNumber',
                companyId: '$usersInfo.companyId',
                email: '$usersInfo.email',
                isAccepted: '$usersInfo.isAccepted',
                dateOfJoining: '$dateOfJoining',
                status: '$status',
                shift : '$shift',
                createdById: '$createdById',
                isActive: '$isActive',
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])

    const totalCount = await Employee.countDocuments({
        ...condition,
        ...child_condition,
    })

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

exports.empDetail = catchAsync(async (req, res, next) => {
    if (!req.body.createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    let condition = {
        createdById: mongoose.Types.ObjectId(req.body.createdById),
    }

    const data = await Employee.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'users',
                let: { user_id: '$createdById' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$user_id'] } } }],
                as: 'userInfo',
            },
        },
        { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'users',
                localField: 'reportingManager',
                foreignField: '_id',
                as: 'reportingInfo',
            },
        },
        { $unwind: { path: '$reportingInfo', preserveNullAndEmptyArrays: true } },

        {
            $project: {
                stateData: '$stateData',
                user_id: '$userInfo._id',
                image: '$userInfo.image',
                empCreatedById: '$userInfo._id',
                empId: '$userInfo.empId',
                firstName: '$userInfo.firstName',
                middleName: '$userInfo.middleName',
                lastName: '$userInfo.lastName',
                age: '$userInfo.age',
                spouse: '$userInfo.spouse',
                fatherName: '$userInfo.fatherName',
                email: '$userInfo.email',
                bloodGroup: '$userInfo.bloodGroup',
                dob: '$userInfo.dob',
                mobileNumber: '$userInfo.mobileNumber',
                gender: '$userInfo.gender',
                roleId: '$userInfo.roleId',
                department: '$userInfo.department',
                designation: '$userInfo.designation',
                branchId: '$userInfo.branchId',
                emp_id: '$_id',
                shift: '$shift',
                dateOfJoining: '$dateOfJoining',
                dateOfConfirmation: '$dateOfConfirmation',
                probationPeriod: '$probationPeriod',
                document: '$document',
                status: '$status',
                empType: '$empType',
                allowEmp: '$allowEmp',
                permanentAddress: '$permanentAddress',
                currentAddress: '$currentAddress',
                educationQualification: '$educationQualification',
                familyDetails: '$familyDetails',
                previousExperience: '$previousExperience',
                salaryDetails: '$salaryDetails',
                bankDetails: '$bankDetails',
                skills: '$skills',
                technology: '$technology',
                domain: '$domain',
                sameAs: '$sameAs',
                nationality: '$nationality',
                companyId: '$companyId',
                createdById: '$createdById',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                reportingToName: '$reportingInfo.firstName',
                reportinglastName: '$reportingInfo.lastName',
                reportingManager: '$reportingManager',
            },
        },
    ])
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})

exports.empUpdate = catchAsync(async (req, res) => {
    const { createdById } = req.body

    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    let condition = {
        createdById: mongoose.Types.ObjectId(req.body.createdById),
    }

    let validateObj = {
        permanentAddress: req.body.permanentAddress,
        currentAddress: req.body.currentAddress,
        previousExperience: req.body.previousExperience,
        educationQualification: req.body.educationQualification,
        familyDetails: req.body.familyDetails,
        document: req.body.document,
        skills: req.body.skills,
        technology: req.body.technology,
        domain: req.body.domain,
        nationality: req.body.nationality,
    }
    await employeeUpdateValidation.validateAsync(validateObj)
    let insertObj = {
        image: req.body.image,
        bloodGroup: req.body.bloodGroup,
        mobileNumber: req.body.mobileNumber,
        isCompleted: true
    }
    // if (!insertObj) return res.json(Response(constants.statusCode.unauth, constants.userMsg.imageReq))
    const { reportingManager } = req.body
    validateObj.reportingManager = reportingManager
    validateObj.sameAs = req.body.sameAs

    const updateUser = await User.findOneAndUpdate({ _id: createdById }, insertObj, {
        new: true,
    })

    const Result = await Employee.findOneAndUpdate(condition, validateObj, {
        new: true,
    })

    if (Result || updateUser) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
})

exports.companyUpdateEmp = catchAsync(async (req, res) => {
    const { _id, createdById } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))
    let userObj = {
        image: req.body.image,
        firstName: req.body.firstName,
        image: req.body.image,
        middleName: req.body.middleName,
        lastName: req.body.lastName,
        mobileNumber: req.body.mobileNumber,
        dob: req.body.dob,
        age: req.body.age,
        gender: req.body.gender,
        fatherName: req.body.fatherName,
        spouse: req.body.spouse,
        empId: req.body.empId,
        roleId: req.body.roleId,
        department: req.body.department,
        designation: req.body.designation,
        branchId: req.body.branchId,
        bloodGroup: req.body.bloodGroup,
        reportingManager: req.body.reportingManager,
    }

    let condition = {
        createdById: mongoose.Types.ObjectId(req.body.createdById),
    }
    let empObj = {
        empType: req.body.empType,
        status: req.body.status,
        dateOfJoining: req.body.dateOfJoining,
        dateOfConfirmation: req.body.dateOfConfirmation,
        probationPeriod: req.body.probationPeriod,
        nationality: req.body.nationality,
        permanentAddress: req.body.permanentAddress,
        sameAs: req.body.sameAs,
        salaryDetails: req.body.salaryDetails,
        bankDetails: req.body.bankDetails,
        shift: req.body.shift,
        allowEmp: req.body.allowEmp,
        currentAddress: req.body.currentAddress,
        previousExperience: req.body.previousExperience,
        educationQualification: req.body.educationQualification,
        familyDetails: req.body.familyDetails,
        document: req.body.document,
        skills: req.body.skills,
        technology: req.body.technology,
        domain: req.body.domain,
        reportingManager: req.body.reportingManager,
    }
    const empResult = await Employee.findOneAndUpdate(condition, empObj, {
        new: true,
    })
    const userResult = await User.findByIdAndUpdate(_id, userObj, {
        new: true,
    })

    if (userResult || empResult) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
})

exports.reSend = catchAsync(async (req, res) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let resetKey = utility.uuid.v1()
    let condition = { _id: mongoose.Types.ObjectId(req.body._id) }

    const data = await User.aggregate([
        { $match: condition },
        {
            $project: {
                _id: '$_id',
                firstName: '$firstName',
                lastName: '$lastName',
                email: '$email',
                empId: '$empId',
                corporateId: '$corporateId',
                companyId: '$companyId',
                resetKey: 1,
            },
        },
    ])
    const updateToken = await User.findOneAndUpdate(condition, { $set: { resetKey: resetKey } })
    const printContents = {
        userId: data[0]._id,
        email: data[0].email,
        firstName: data[0].firstName,
        lastName: data[0].lastName,
        empId: data[0].empId,
        corporateId: data[0].corporateId,
        acceptLink: config.frontEndURL + 'ResetPassword/' + resetKey,
    }
    const options = {
        to: data[0].email,
        subject: constants.email.invitationTitle,
    }
    const mailResponse = await mailer.inviteEmployee(options, printContents)
    if (!data[0] || !mailResponse) return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))

    return res.json(Response(constants.statusCode.ok, constants.messages.resend))
})

exports.reportingStructureList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 10
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)

    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { firstName: 1 }
    }
    let child_condition = {}
    let condition = {}
    if (req.body.isActive != '' && req.body.isActive != undefined) {
        condition.isActive = req.body.isActive == 'true' ? true : false
    }
    const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')
    if (req.body.searchText) {
        child_condition.$or = [{ firstName: new RegExp(searchText, 'gi') }]
    }

    if (!req.body.reportingManager) return res.json(Response(constants.statusCode.unauth, constants.messages.reportingManger))
    condition.reportingManager = mongoose.Types.ObjectId(req.body.reportingManager)

    if (!req.body.companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))
    condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }
    const data = await Employee.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'users',
                let: { user_id: '$createdById' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$user_id'] } } }],
                as: 'usersInfo',
            },
        },
        { $unwind: { path: '$usersInfo', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'designations',
                localField: 'usersInfo.designation',
                foreignField: '_id',
                as: 'designationsData',
            },
        },

        { $unwind: { path: '$designationsData', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'departments',
                localField: 'usersInfo.department',
                foreignField: '_id',
                as: 'departmentData',
            },
        },

        { $unwind: { path: '$departmentData', preserveNullAndEmptyArrays: true } },
        // {
        //     $lookup: {
        //         from: 'attendances',
        //         localField: 'usersInfo.empId',
        //         foreignField: 'empId',
        //         as: 'attendancesData',
        //     },
        // },

        // { $unwind: { path: '$attendancesData', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                empId: '$usersInfo.empId',
                firstName: '$usersInfo.firstName',
                companyId: '$usersInfo.companyId',
                designation: '$designationsData.title',
                department: '$departmentData.title',
                createdById: '$createdById',
                // attendancesData: '$attendancesData',
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await Employee.countDocuments({
        ...condition,
        ...child_condition,
    })
    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

exports.updateReporting = catchAsync(async (req, res) => {
    const { createdById } = req.body

    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    let condition = {
        createdById: {
            $in: [mongoose.Types.ObjectId(req.body.createdById)],
        },
    }

    let empInfo = await Employee.findOneAndUpdate(condition, { $set: { reportingManager: mongoose.Types.ObjectId(req.body.reportingManager) } })
    if (empInfo) {
        return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    } else {
        return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
    }
})

exports.changeStatus = catchAsync(async (req, res) => {
    const { _id } = req.body
    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = {
        createdById: mongoose.Types.ObjectId(req.body._id),
    }
    let update = {
        // isActive: req.body.isActive ? false : true,
        isActive: !req.body.isActive,
    }

    let empInfo = await Employee.findOneAndUpdate(condition, { $set: update })
    let userInfo = await User.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, { $set: update })
    const msg = req.body.isActive ? constants.messages.deActivated : constants.messages.activated

    if (empInfo && userInfo) {
        return res.json(Response(constants.statusCode.ok, msg))
        // return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    } else {
        return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
    }
})

exports.deleteUser = softDelete(User)

exports.policyDetail = catchAsync(async (req, res, next) => {
    if (!req.body.companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    let condition = {
        companyId: mongoose.Types.ObjectId(req.body.companyId),
        isActive: true,
        enforcePolicy: true,
        departments: { $elemMatch: { departmentId: mongoose.Types.ObjectId(req.body.Department) } },
        designations: { $elemMatch: { designationId: mongoose.Types.ObjectId(req.body.Designation) } },
    }

    const data = await Companypolicy.aggregate([
        { $match: condition },
        {
            $project: {
                name: '$name',
                file: '$file',
                departments: '$departments',
                description: '$description',
                designations: '$designations',
            },
        },
        // { $match: child_condition },
    ])
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})
