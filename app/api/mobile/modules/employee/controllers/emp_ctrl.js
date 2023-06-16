'use strict'

const catchAsync = require('../../../../../lib/catchAsync'),
    Response = require('../../../../../../app/lib/response'),
    constants = require('../../../../../../app/lib/constants'),
    query = require('../../../../../../app/lib/common_query'),
    toggleStatus = require('./../../../../v1/modules/factory/changeStatus'),
    softDelete = require('./../../../../v1/modules/factory/softDelete'),
    mongoose = require('mongoose'),
    User = require('./../../../../v1/modules/user/models/user_model'),
    Employee = require('../../../../v1/modules/employee/models/empPersonalDetail_model'),
    userAuth = require('./../../../../v1/modules/user/models/user_auth'),
    uuid = require('uuid'),
    jwt = require('jsonwebtoken'),
    config = require('../../../../../config/config').get(process.env.NODE_ENV)

exports.empLogin = catchAsync(async (req, res, next) => {
    if (!req.body.email) return res.json(Response(constants.statusCode.unauth, constants.messages.emailReq))
    if (!req.body.password) return res.json(Response(constants.statusCode.unauth, constants.messages.passwordReq))
    if (!req.body.corporateId) return res.json(Response(constants.statusCode.unauth, constants.messages.corporateId))
    const condition = {
        email: req.body.email,
    }

    const finalResult = await query.findDataWithMultiplePopulate(User, condition, 'roleId', 'designation')

    if (!finalResult.status) return res.json(internalError())

    const userInfo = finalResult.data[0]

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

            return res.json(Response(constants.statusCode.ok, constants.messages.loginSuccessfully, finalObjectToBeSend, otherData))

            // if (userInfo.roleId.roleTitle === constants.roleName.EMPLOYEE) {
            //     return res.json(Response(constants.statusCode.ok, constants.messages.loginSuccessfully, finalObjectToBeSend, otherData))
            // } else {
            //     return res.json({
            //         code: constants.statusCode.internalError,
            //         message: constants.messages.notallowed,
            //     })
            // }
        } else {
            return res.json(Response(constants.statusCode.unauth, constants.messages.incorrectPassword))
        }
    })
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
                from: 'designations',
                let: { designation_id: '$userInfo.designation' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$designation_id'] } } }],
                as: 'designationInfo',
            },
        },
        { $unwind: { path: '$designationInfo', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: '$_id',
                status: '$status',
                isActive: '$isActive',
                dob: '$userInfo.dob',
                image: '$userInfo.image',
                companyId: '$companyId',
                isDeleted: '$isDeleted',
                empId: '$userInfo.empId',
                email: '$userInfo.email',
                createdById: '$createdById',
                title: '$designationInfo.title',
                firstName: '$userInfo.firstName',
                mobileNumber: '$userInfo.mobileNumber',
            },
        },
    ])
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})
exports.empUpdate = catchAsync(async (req, res) => {
    const { _id } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    let insertObj = {
        image: req.body.image,
        mobileNumber: req.body.mobileNumber,
    }

    const updateUser = await User.findByIdAndUpdate(_id, insertObj, {
        new: true,
    })

    if (updateUser) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
})
exports.changeStatus = toggleStatus(User)

exports.deleteUser = softDelete(User)
