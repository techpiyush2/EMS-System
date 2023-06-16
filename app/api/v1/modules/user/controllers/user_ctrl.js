'use strict'

const catchAsync = require('../../../../../lib/catchAsync'),
    Response = require('../../../../../../app/lib/response'),
    constants = require('../../../../../../app/lib/constants'),
    query = require('../../../../../../app/lib/common_query'),
    toggleStatus = require('./../../factory/changeStatus'),
    { companyValidation } = require('./../../../../../lib/joiValidation'),
    { userValidation, userAdminValidation } = require('./../../../../../lib/joiValidation'),
    softDelete = require('./../../factory/softDelete'),
    utility = require('./../../../../../lib/utility'),
    mailer = require('./../../../../../lib/mailer'),
    update = require('./../../factory/update'),
    mongoose = require('mongoose'),
    User = require('../models/user_model'),
    Employee = require('../../employee/models/empPersonalDetail_model'),
    Company = require('../../company/models/company_model'),
    Department = require('../../department/models/department_model'),
    Roles = require('../../role/models/role_model'),
    userAuth = require('../models/user_auth'),
    uuid = require('uuid'),
    fs = require('fs'),
    jwt = require('jsonwebtoken'),
    moment = require('moment'),
    LeaveApply = require('../../leaveApply/models/leaveApply_model'),
    config = require('../../../../../config/config').get(process.env.NODE_ENV)
const { date } = require('joi')
const bcrypt = require('bcrypt')

exports.login = catchAsync(async (req, res, next) => {
    if (!req.body.email) return res.json(Response(constants.statusCode.unauth, constants.messages.emailReq))
    if (!req.body.password) return res.json(Response(constants.statusCode.unauth, constants.messages.passwordReq))
    if (!req.body.corporateId) return res.json(Response(constants.statusCode.unauth, constants.messages.corporateId))
    const condition = { email: req.body.email, corporateId: req.body.corporateId }

    const finalResult = await query.findDataWithMultiplePopulate(User, condition, 'roleId', 'designation', 'department')

    req.body.percentageData = finalResult
    if (!finalResult.status) return res.json(internalError())

    const userInfo = finalResult.data[0]
    // userInfo.
    if (userInfo.roleId.roleTitle == 'EMPLOYEE' || userInfo.roleId.roleTitle == 'HR') {
        userInfo.isAddDepartment = undefined
        userInfo.isAddDesignation = undefined
        userInfo.isAddBranch = undefined
        userInfo.isAddSkill = undefined
        userInfo.isAddTechnology = undefined
        userInfo.isAddShift = undefined
        userInfo.isAddHardware = undefined
        userInfo.isAddEmployee = undefined
        userInfo.isAddDomain = undefined
        userInfo.isAddLeave = undefined
        userInfo.isAddPolicy = undefined
    }
    if (!userInfo) {
        return res.json(Response(constants.statusCode.notFound, constants.messages.incorrectEmail))
    }

    if (userInfo.corporateId != req.body.corporateId) {
        return res.json(Response(constants.statusCode.notFound, constants.messages.correctCorporateId))
    }
    if (!userInfo.isActive) return res.json(Response(constants.statusCode.forbidden, constants.messages.accountNotActive))
    if (userInfo.isDeleted) return res.json(Response(constants.statusCode.forbidden, constants.messages.accountDeleted))

    userInfo.comparePassword(req.body.password, async function (err, isMatch) {
        if (err) {
            return res.json(Response(constants.statusCode.internalError, constants.messages.internalServerError))
        }
        if (isMatch) {
            const parmas = {
                userId: userInfo._id,
            }

            const expirationDuration = 60 * 60 * 24 * 15
            // expiration duration format sec:min:hour:day. ie: 15 days
            const jwtToken = jwt.sign(parmas, constants.cryptoConfig.secret, {
                expiresIn: expirationDuration,
            })
            const otherData = await userAuth.create({
                token: jwtToken,
                userId: userInfo._id,
                isActive: true,
                loginTime: new Date(),
            })

            userInfo.password = undefined

            let finalObjectToBeSend = {}

            finalObjectToBeSend = {
                token: jwtToken,
                userInfo,
            }

            return res.json(Response(constants.statusCode.ok, constants.messages.loginSuccessfully, finalObjectToBeSend))
        } else {
            return res.json(Response(constants.statusCode.unauth, constants.messages.incorrectPassword))
        }
    })
})

exports.userList = catchAsync(async (req, res) => {
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

    let condition = { isActive: true, isAccepted: 'ACCEPT' }
    if (req.body.isActive != '' && req.body.isActive != undefined) {
        condition.isActive = req.body.isActive == 'true' ? true : false
    }

    if (req.body.isAccepted != '' && req.body.isAccepted != undefined) {
        condition.isAccepted = req.body.isAccepted
    }
    const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')

    if (req.body.searchText) {
        child_condition.$or = [{ firstName: new RegExp(searchText, 'gi') }]
    }

    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }
    if (req.body.createdById) child_condition.createdById = mongoose.Types.ObjectId(req.body.createdById)
    if (req.body.roleTitle) {
        const findRoleDoc = await Roles.findOne({ roleTitle: req.body.roleTitle })
        
        condition.roleId = mongoose.Types.ObjectId(findRoleDoc._id)
    }

    const data = await User.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'companies',
                localField: '_id',
                foreignField: 'createdById',
                as: 'companyData',
            },
        },

        { $unwind: { path: '$companyData', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'roles',
                localField: 'roleId',
                foreignField: '_id',
                as: 'roleData',
            },
        },

        { $unwind: { path: '$roleData', preserveNullAndEmptyArrays: true } },

        {
            $project: {
                _id: '$_id',
                email: '$email',
                firstName: '$firstName',
                createdById: '$createdById',
                mobileNumber: '$companyData.mobileNumber',
                companyName: '$companyData.companyName',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                isAccepted: '$isAccepted',
                roleTitle: '$roleData.roleTitle',
                roleId: '$roleId',
                companyCreatedById: '$companyData.createdById',
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])

    const totalCount = await User.countDocuments({
        ...condition,
        ...child_condition,
    })

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

exports.employeeList = catchAsync(async (req, res) => {
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
    let condition = { isActive: true, isAccepted: 'ACCEPT' }
    if (req.body.isActive != '' && req.body.isActive != undefined) {
        condition.isActive = req.body.isActive == 'true' ? true : false
    }
    const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')
    if (req.body.searchText) {
        child_condition.$or = [{ firstName: new RegExp(searchText, 'gi') }]
    }

    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }

    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
    if (req.body.branchId) condition.branchId = mongoose.Types.ObjectId(req.body.branchId)

    const data = await User.aggregate([
        { $match: condition },
        {
            $project: {
                firstName: '$firstName',
                lastName: '$lastName',
                empId: '$empId',
                email: '$email',
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await User.countDocuments({
        ...condition,
        ...child_condition,
    })
    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

exports.userRegister = catchAsync(async (req, res) => {
    let insertObj = {
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        mobileNumber: req.body.mobileNumber,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        companyId: req.body.companyId,
        postalCode: req.body.postalCode,
        image: req.body.image,
    }

    // to prevent dublicacy

    const userRes = await User.findOne({
        email: req.body.email,
    })
    if (userRes) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))

    const { roleId } = req.body

    if (!roleId) return res.json(Response(constants.statusCode.unauth, constants.messages.roleId))
    insertObj.roleId = roleId
    const finalResult = await User.create(insertObj)
    if (!finalResult) return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
    else return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
})

exports.loginDetails = catchAsync(async (req, res, next) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = { _id: mongoose.Types.ObjectId(req.body._id) }

    const data = await User.aggregate([
        { $match: condition },
        {
            $project: {
                firstName: '$firstName',
                lastName: '$lastName',
                phoneNumber: '$phoneNumber',
                email: '$email',
                mobileNumber: '$mobileNumber',
                image: '$image',
            },
        },
    ])
    if (data.length == 0) return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})

exports.adminUpdate = catchAsync(async (req, res) => {
    const { _id } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    let validateObj = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        mobileNumber: req.body.mobileNumber,
        email: req.body.email,
        image: req.body.image,
    }

    await userAdminValidation.validateAsync(validateObj)

    const Result = await User.findByIdAndUpdate(_id, validateObj, {
        new: true,
    })

    if (Result) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
})

exports.adminLogin = catchAsync(async (req, res) => {
    if (!req.body.email) return res.json(Response(constants.statusCode.unauth, constants.messages.emailReq))
    if (!req.body.password) return res.json(Response(constants.statusCode.unauth, constants.messages.passwordReq))

    const condition = { email: req.body.email }

    let finalResult = await query.findoneWithPopulate(User, condition, 'roleId')

    if (!finalResult.data) {
        return res.json(Response(constants.statusCode.notFound, constants.messages.incorrectEmail))
    }

    const userInfo = finalResult.data
    userInfo.comparePassword(req.body.password, async function (err, isMatch) {
        if (err) {
            return res.json(Response(constants.statusCode.internalError, constants.messages.internalServerError))
        }
        if (isMatch) {
            const params = {
                userId: userInfo._id,
            }

            const expirationDuration = 60 * 60 * 24 * 15
            // expiration duration format sec:min:hour:day. ie: 15 days
            const jwtToken = jwt.sign(params, constants.cryptoConfig.secret, {
                expiresIn: expirationDuration,
            })
            const otherData = await userAuth.create({
                token: jwtToken,
                userId: userInfo._id,
                isActive: true,
                loginTime: new Date(),
            })

            userInfo.password = undefined
            userInfo.isCompleted = undefined
            userInfo.percentageData = undefined
            userInfo.invitedById = undefined
            userInfo.department = undefined
            userInfo.designation = undefined
            userInfo.domainId = undefined
            userInfo.branchId = undefined
            userInfo.companyId = undefined
            userInfo.state = undefined
            userInfo.country = undefined
            userInfo.isAddDepartment = undefined
            userInfo.isAddDesignation = undefined
            userInfo.isAddBranch = undefined
            userInfo.isAddSkill = undefined
            userInfo.isAddTechnology = undefined
            userInfo.isAddShift = undefined
            userInfo.isAddHardware = undefined
            userInfo.isAddEmployee = undefined
            userInfo.isAddDomain = undefined
            userInfo.isAddLeave = undefined
            userInfo.isAddPolicy = undefined
            userInfo.empAttendanceId = undefined

            let finalObjectToBeSend = {}

            finalObjectToBeSend = {
                token: jwtToken,
                userInfo,
            }

            if (userInfo.roleId.roleTitle === 'SUPERADMIN') {
                return res.json(Response(constants.statusCode.ok, constants.messages.loginSuccessfully, finalObjectToBeSend))
            } else {
                return res.json(Response(constants.statusCode.internalError, constants.messages.superAdmin))
            }
        } else {
            return res.json(Response(constants.statusCode.unauth, constants.messages.incorrectPassword))
        }
    })
})

exports.userLogout = catchAsync(async (req, res) => {
    const condition = {
        userId: mongoose.Types.ObjectId(req.body.userId),
        token: req.headers['x-access-token'],
    }

    const updateData = await query.updateOneDocument(userAuth, condition, {
        logoutTime: new Date(),
        token: undefined,
    })

    if (!updateData) {
        return res.json(Response(constants.statusCode.notFound, constants.messages.userNotFound))
    } else {
        return res.json(Response(constants.statusCode.ok, constants.messages.logoutSuccessfully))
    }
})

exports.checkToken = catchAsync(async (req, res) => {
    if (!req.body.token) return res.json(Response(constants.statusCode.unauth, constants.messages.tokenReq))

    const condition = { resetKey: req.body.token }
    const fields = { _id: 1 }
    const userObj = await query.findoneData(User, condition, fields)

    if (!userObj.status)
        return res.json({
            code: constants.statusCode.internalServerError,
            message: constants.messages.internalServerError,
        })

    // If no user exist with that token mean token has expired
    if (!userObj.data) {
        return res.json(Response(constants.statusCode.unauth, constants.messages.tokenExpire))
    } else {
        return res.json(Response(constants.statusCode.ok, constants.messages.tokenExist))
    }
})

exports.forgotPassword = catchAsync(async (req, res) => {
    if (!req.body.email) return res.json(Response(constants.statusCode.unauth, constants.messages.emailReq))

    const condition = { email: req.body.email },
        updateData = {
            resetKey: utility.uuid.v1(),
        }

    const finalResult = await query.updateOneDocument(User, condition, updateData)

    // Checking the database response
    if (!finalResult.status) return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))

    if (!finalResult.data || !finalResult.data.email) return res.json(Response(constants.statusCode.notFound, constants.messages.incorrectEmail))

    if (!finalResult.data.isActive) return res.json(Response(constants.statusCode.forbidden, constants.messages.accountNotActive))

    if (finalResult.data.isDeleted) return res.json(Response(constants.statusCode.notFound, constants.messages.accountDeleted))

    // Sending email
    const printContents = {
        userId: finalResult.data._id,
        email: finalResult.data.email,
        firstName: finalResult.data.firstName,
        link: config.adminBaseUrl + 'resetPass/' + updateData.resetKey,
    }
    const options = {
        to: finalResult.data.email,
        subject: constants.email.forgotPasswordTitle,
    }
    const mailResponse = await mailer.forgotPasswordEmail(options, printContents)
    if (mailResponse) return res.json(Response(constants.statusCode.ok, constants.messages.forgotPasswordSuccess))

    return res.json(Response(constants.statusCode.internalError, constants.messages.emailNotSend))
})

exports.companyForgotPassword = catchAsync(async (req, res) => {
    if (!req.body.email) return res.json(Response(constants.statusCode.unauth, constants.messages.emailReq))

    const condition = { email: req.body.email },
        updateData = {
            resetKey: utility.uuid.v1(),
        }

    const finalResult = await query.updateOneDocument(User, condition, updateData)

    // Checking the database response
    if (!finalResult.status) return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))

    if (!finalResult.data || !finalResult.data.email) return res.json(Response(constants.statusCode.notFound, constants.messages.incorrectEmail))

    if (!finalResult.data.isActive) return res.json(Response(constants.statusCode.forbidden, constants.messages.accountNotActive))

    if (finalResult.data.isDeleted) return res.json(Response(constants.statusCode.notFound, constants.messages.accountDeleted))

    // Sending email
    const printContents = {
        userId: finalResult.data._id,
        email: finalResult.data.email,
        companyName: finalResult.data.firstName,
        link: config.adminBaseUrl + 'resetPassword/' + updateData.resetKey,
    }
    const options = {
        to: finalResult.data.email,
        subject: constants.email.forgotPasswordTitle,
    }
    const mailResponse = await mailer.companyForgotPasswordEmail(options, printContents)
    if (mailResponse) return res.json(Response(constants.statusCode.ok, constants.messages.forgotPasswordSuccess))

    return res.json(Response(constants.statusCode.internalError, constants.messages.emailNotSend))
})

exports.adminForgotPassword = catchAsync(async (req, res) => {
    if (!req.body.email) return res.json(Response(constants.statusCode.unauth, constants.messages.emailReq))

    const condition = { email: req.body.email },
        updateData = {
            resetKey: utility.uuid.v1(),
        }

    const finalResult = await query.updateOneDocument(User, condition, updateData)

    if (!finalResult.status) return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))

    if (!finalResult.data || !finalResult.data.email) return res.json(Response(constants.statusCode.notFound, constants.messages.incorrectEmail))

    if (!finalResult.data.isActive) return res.json(Response(constants.statusCode.forbidden, constants.messages.accountNotActive))

    if (finalResult.data.isDeleted) return res.json(Response(constants.statusCode.notFound, constants.messages.accountDeleted))

    // Sending email
    const printContents = {
        userId: finalResult.data._id,
        email: finalResult.data.email,
        userName: finalResult.data.firstName,
        link: config.superadminBaseUrl + 'resetpassword/' + updateData.resetKey,
    }

    const options = {
        to: finalResult.data.email,
        subject: constants.email.forgotPasswordTitle,
    }
    const mailResponse = await mailer.adminForgotPasswordEmail(options, printContents)
    if (mailResponse) return res.json(Response(constants.statusCode.ok, constants.messages.forgotPasswordSuccess))

    return res.json(Response(constants.statusCode.internalError, constants.messages.emailNotSend))
})

exports.resetPassword = catchAsync(async (req, res) => {
    const { token, newPassword } = req.body
    const condition = { resetKey: token }
    const fields = { _id: 1, password: 1, resetKey: 1 }
    const userObj = await User.findOne(condition, fields)
    console.log('userObj=======', userObj)
    if (userObj) {
        userObj.resetKey = null
        userObj.password = newPassword

        userObj.isActive = true
        userObj.isAccepted = 'ACCEPT'
        userObj.resetKey = null
        userObj.save(async function (err, data) {
            if (err) {
                return res.json(Response(constants.statusCode.internalServerError, err))
            } else {
                userObj.password = undefined

                return res.json(Response(constants.statusCode.ok, constants.messages.pswdChangeSuccess, userObj.password))
            }
        })
    } else {
        return res.json(Response(constants.statusCode.notFound, constants.messages.tokenExpire))
    }
})

exports.changePassword = catchAsync(async (req, res) => {
    const { id, oldPassword, newPassword, confirmPassword } = req.body
    const condition = { _id: id }
    const user = await query.findoneData(User, condition)
    if (user.status && user.data) {
        user.data.comparePassword(oldPassword, async (err, isMatch) => {
            if (err) {
                return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
            }
            if (isMatch === false) {
                return res.json(Response(constants.statusCode.internalServerError, constants.messages.wrongOldPswd))
            }

            user.data.password = newPassword
            user.data.passwordConfirm = confirmPassword
            user.data.save(async function (err, data) {
                if (err) {
                    res.json(Response(constants.statusCode.internalServerError, err))
                } else {
                    return res.json(Response(constants.statusCode.ok, constants.messages.pswdChangeSuccess))
                }
            })
        })
    } else {
        return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
    }
})

exports.inviteUser = catchAsync(async (req, res) => {
    let insertObj = {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        mobileNumber: req.body.mobileNumber,
        resetKey: utility.uuid.v1(),
        roleId: req.body.roleId,
        createdById: req.body.createdById,
    }
    let companyObj = {
        companyName: req.body.companyName,
        email: req.body.email,
        mobileNumber: req.body.mobileNumber,
        createdById: '',
    }

    if (!req.body.firstName) return res.json(Response(constants.statusCode.unauth, constants.userMsg.firstNameReq))
    if (!req.body.lastName) return res.json(Response(constants.statusCode.unauth, constants.userMsg.lastNameReq))
    if (!req.body.mobileNumber) return res.json(Response(constants.statusCode.unauth, constants.userMsg.mobileNumberReq))
    if (!req.body.companyName) return res.json(Response(constants.statusCode.unauth, constants.messages.nameReq))
    const userRes = await User.findOne({
        email: req.body.email,
    })
    if (userRes) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))

    const { createdById } = req.body

    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))

    insertObj.corporateId = req.body.companyName.substring(0, 4) + '-' + moment().year()

    const role_id = await Roles.findOne({ roleTitle: 'COMPANY' }, { _id: 1 })
    insertObj.roleId = role_id._id
    const finalResult = await query.uniqueInsertIntoCollection(User, insertObj)
    if (!finalResult) return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))

    companyObj.createdById = finalResult.userData._id

    const companyResult = await query.uniqueInsertIntoCollection(Company, companyObj)
    if (!companyResult) return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
    ;/   Send Mail           /
    const printContents = {
        userId: finalResult.userData._id,
        email: finalResult.userData.email,
        firstName: finalResult.userData.firstName,
        lastName: finalResult.userData.lastName,
        // companyName: companyResult.userData.companyName,
        // mobileNumber: companyResult.userData.mobileNumber,
        corporateId: finalResult.userData.corporateId,
        acceptLink: config.adminBaseUrl + 'resetPassword/' + insertObj.resetKey,
        // declineLink: config.adminBaseUrl + 'Decline/' + insertObj.resetKey,
    }

    const options = {
        to: finalResult.userData.email,
        subject: constants.email.invitationTitle,
    }

    const mailResponse = await mailer.inviteCompany(options, printContents)

    if (!finalResult || !companyResult || !mailResponse) return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
    return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
})

exports.acceptInvitation = catchAsync(async (req, res) => {
    const { token, newPassword } = req.body
    const condition = { resetKey: token }
    const fields = {
        _id: 1,
        isDeleted: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        createdById: 1,
    }
    const userData = await User.findOne(condition, fields)

    // If no user exist with that token mean token has expired
    if (!userData) return res.json(Response(constants.statusCode.unauth, constants.messages.tokenExpire))

    if (userData.isDeleted) return res.json(Response(constants.statusCode.unauth, constants.messages.accountDeleted))

    userData.resetKey = ''
    userData.isActive = true
    userData.isAccepted = 'ACCEPT'
    userData.password = newPassword

    /** We have used .save so that middlewares of model can run and password get encrypted */
    userData.save(async function (err) {
        if (err) {
            res.json(Response(constants.statusCode.internalServerError, err))
        } else {
            /** Sending email to admin that user has accepted the invitation */
            const inviteObj = await User.findOne({ _id: userData.createdById }, { _id: 1, email: 1, firstName: 1, lastName: 1 })

            if (!inviteObj) return res.json(Response(constants.statusCode.internalServerError, constants.messages.acceptedMailNotSend))
            let printContents = {
                name: inviteObj.firstName + ' ' + inviteObj.lastName,
                invitedUser: userData.firstName + ' ' + userData.lastName,
            }

            const options = {
                from: userData.email,
                to: inviteObj.email,
                subject: constants.mailSubject.invitationAccepted,
            }

            const mailResponse = await mailer.acceptanceConfirmation(options, printContents)

            if (mailResponse) return res.json(Response(constants.statusCode.ok, constants.messages.pswdChangeSuccess))
            else return res.json(Response(constants.statusCode.internalError, constants.messages.acceptedMailNotSend))
        }
    })
})

exports.declineInvitation = catchAsync(async (req, res) => {
    if (!req.body.token) return res.json(Response(constants.statusCode.unauth, constants.messages.tokenReq))

    const condition = { resetKey: req.body.token }
    const userData = await User.findOne(condition)

    // If no user exist with that token mean token has expired
    if (!userData) return res.json(Response(constants.statusCode.unauth, constants.messages.tokenExpire))

    userData.resetKey = ''
    userData.isActive = false
    userData.isAccepted = 'DECLINED'

    // We have used .save so that middlewares of model can run and password get encrypted
    userData.save(async function (err) {
        if (err) {
            res.json(Response(constants.statusCode.internalServerError, err))
        } else {
            /** Sending email to admin that user has decline the invitation */
            const inviteObj = await User.findOne({ _id: userData.createdById }, { _id: 1, email: 1, firstName: 1, lastName: 1 })

            if (!inviteObj) return res.json(Response(constants.statusCode.internalServerError, constants.messages.declinedMailNotSend))
            /** Sending Email */
            let printContents = {
                name: inviteObj.firstName + ' ' + inviteObj.lastName,
                invitedUser: userData.firstName + ' ' + userData.lastName,
            }

            const options = {
                from: userData.email,
                to: inviteObj.email,
                subject: constants.mailSubject.invitationDeclined,
            }

            const mailResponse = await mailer.declineInvitation(options, printContents)

            if (mailResponse) return res.json(Response(constants.statusCode.ok, constants.mailSubject.invitationDeclined))
            else return res.json(Response(constants.statusCode.internalError, constants.messages.internalServerError))
        }
    })
})

exports.companySelfRegister = catchAsync(async (req, res) => {
    let insertObj = {
        email: req.body.email,
        mobileNumber: req.body.mobileNumber,
        roleId: req.body.roleId,
        country: req.body.country,
        firstName: req.body.firstName,
    }
    let companyObj = {
        email: req.body.email,
        mobileNumber: req.body.mobileNumber,
        createdById: '',
        companyName: '',
    }

    if (!req.body.mobileNumber) return res.json(Response(constants.statusCode.unauth, constants.userMsg.mobileNumberReq))
    if (!req.body.email) return res.json(Response(constants.statusCode.unauth, constants.userMsg.emailReq))
    if (!req.body.firstName) return res.json(Response(constants.statusCode.unauth, constants.userMsg.firstNameReq))

    const userRes = await User.findOne({
        email: req.body.email,
    })
    if (userRes) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))

    const { country } = req.body

    if (!country) return res.json(Response(constants.statusCode.unauth, constants.messages.countryId))
    insertObj.corporateId = req.body.firstName.substring(0, 4) + '-' + moment().year()

    const role_id = await Roles.findOne({ roleTitle: 'COMPANY' }, { _id: 1 })
    insertObj.roleId = role_id._id

    const finalResult = await query.uniqueInsertIntoCollection(User, insertObj)

    if (!finalResult) return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))

    companyObj.createdById = finalResult.userData._id
    companyObj.companyName = finalResult.userData.firstName
    const companyResult = await query.uniqueInsertIntoCollection(Company, companyObj)

    if (!companyResult) return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))

    const condition = { email: req.body.email },
        updateData = {
            resetKey: utility.uuid.v1(),
        }

    const emailResult = await query.updateOneDocument(User, condition, updateData)

    // Send Mail
    const printContents = {
        userId: finalResult.userData._id,
        email: finalResult.userData.email,
        companyName: companyResult.userData.companyName,
        mobileNumber: companyResult.userData.mobileNumber,
        corporateId: finalResult.userData.corporateId,
        link: config.adminBaseUrl + 'resetPassword/' + updateData.resetKey,
    }

    const options = {
        to: finalResult.userData.email,
        subject: constants.email.invitationTitle,
    }

    const mailResponse = await mailer.companyRegisterEmail(options, printContents)

    if (!finalResult || !companyResult || !mailResponse || !emailResult) return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
    return res.json(Response(constants.statusCode.ok, constants.messages.forgotPasswordSuccess))
})

exports.hrList = catchAsync(async (req, res) => {
    let condition = { companyId: mongoose.Types.ObjectId(req.body.companyId), branchId: mongoose.Types.ObjectId(req.body.branchId), isAccepted: 'ACCEPT' }

    const child_condition = { roleTitle: 'HR' }

    const data = await User.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'roles',
                localField: 'roleId',
                foreignField: '_id',
                as: 'roleData',
            },
        },
        { $unwind: { path: '$roleData' } },

        {
            $project: {
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                firstName: '$firstName',
                lastName: '$lastName',
                roleTitle: '$roleData.roleTitle',
                roleId: '$roleId',
                createdById: '$createdById',
                companyId: '$companyId',
                reportingManager: '$reportingManager',
                branchId: '$branchId',
            },
        },
        { $match: child_condition },
    ])
    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, []))
})

exports.assignReportingList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 10
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)

    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { department: 1, _id: 1 }
    }
    let condition = { isAccepted: 'ACCEPT' }
    if (req.body.isActive != '' && req.body.isActive != undefined) {
        condition.isActive = req.body.isActive == 'true' ? true : false
    }

    // if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
    // if (req.body.department) condition.department = mongoose.Types.ObjectId(req.body.department)

    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }

    if (req.body.department == req.body.department)
        // condition.department = mongoose.Types.ObjectId(req.body.department)

        condition.$or = [{ department: mongoose.Types.ObjectId(req.body.department) }, { companyId: mongoose.Types.ObjectId(req.body.companyId) }]

    console.log(condition)
    const data = await User.aggregate([
        { $match: condition },
        {
            $project: {
                empId: 1,
                firstName: 1,
                middleName: 1,
                lastName: 1,
                department: 1,
            },
        },
        // { $count: 'department' },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])

    const totalCount = await User.countDocuments(condition)

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})
exports.changeStatus = toggleStatus(User)

exports.deleteUser = softDelete(User)
