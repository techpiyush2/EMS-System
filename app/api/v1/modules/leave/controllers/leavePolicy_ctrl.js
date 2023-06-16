const { validate } = require('uuid')
const Response = require('../../../../../lib/response'),
    catchAsync = require('./../../../../../lib/catchAsync'),
    toggleStatus = require('./../../factory/changeStatus'),
    constants = require('./../../../../../lib/constants'),
    query = require('./../../../../../lib/common_query'),
    softDelete = require('./../../factory/softDelete'),
    { leaveValidation } = require('./../../../../../lib/joiValidation'),
    LeavePolicy = require('../models/leavePolicy_model'),
    User = require('../../user/models/user_model'),
    mongoose = require('mongoose'),
    moment = require('moment')
exports.addLeavePolicy = catchAsync(async (req, res, next) => {
    let validateObj = {
        name: req.body.name,
        code: req.body.code,
        color: req.body.color,
        type: req.body.type,
        basedOn: req.body.basedOn,
        unit: req.body.unit,
        applicable: req.body.applicable,
    }
    
    const isExist = await LeavePolicy.findOne({
        name: req.body.name,
        companyId: req.body.companyId,
        createdById: req.body.createdById,
    })
    if (isExist) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))

    await leaveValidation.validateAsync(validateObj)

    const { createdById, companyId, leaveGrant, description, entitleMent, maxRequestNo, isIncludeHoliday, isSandwich } = req.body
    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))
    if (!companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))
    validateObj.isSandwich = isSandwich
    validateObj.createdById = createdById
    validateObj.companyId = companyId
    validateObj.leaveGrant = leaveGrant
    validateObj.entitleMent = entitleMent
    validateObj.maxRequestNo = maxRequestNo
    validateObj.description = description
    validateObj.isIncludeHoliday = isIncludeHoliday
    if (validateObj.basedOn == 'FIXED_ENTITLEMENT') {
        validateObj.leaveGrant = {}
    } else if (validateObj.basedOn == 'LEAVE_GRANT') {
        validateObj.entitleMent = {}
    }

    let leaveInfo = await LeavePolicy.create(validateObj)

    const { userId } = req.body
    let updatePercentage = await User.findByIdAndUpdate({ _id: userId }, { isAddLeave: true, percentageData: req.body.percentageData })

    if (leaveInfo) {
        return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
    } else {
        return res.json(Response(constants.statusCode.internalServerError, constants.statusCode.internalError))
    }
})

exports.leavePolicyList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 10
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)

    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { brand: 1 }
    }
    let child_condition = {}
    let condition = {}
    if (req.body.isActive != '' && req.body.isActive != undefined) {
        condition.isActive = req.body.isActive == 'true' ? true : false
    }
    const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')
    if (req.body.searchText) {
        child_condition.$or = [{ name: new RegExp(searchText, 'gi') }]
    }

    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }

    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
    const data = await LeavePolicy.aggregate([
        { $match: condition },

        {
            $project: {
                name: '$name',
                type: '$type',
                color: '$color',
                basedOn: '$basedOn',
                unit: '$unit',
                companyId: '$companyId',
                createdById: '$createdById',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                isSandwich: '$isSandwich',
                isIncludeHoliday: '$isIncludeHoliday',
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await LeavePolicy.countDocuments({
        ...condition,
        ...child_condition,
    })

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

exports.leavePolicyUpdate = catchAsync(async (req, res) => {
    const { _id } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    let validateObj = {
        name: req.body.name,
        code: req.body.code,
        color: req.body.color,
        type: req.body.type,
        applicable: req.body.applicable,
    }

    const { leaveGrant, description, entitleMent, unit, basedOn, maxRequestNo, isSandwich, isIncludeHoliday } = req.body

    validateObj.isSandwich = isSandwich
    validateObj.isIncludeHoliday = isIncludeHoliday
    validateObj.leaveGrant = leaveGrant
    validateObj.description = description
    validateObj.entitleMent = entitleMent
    validateObj.unit = unit
    validateObj.basedOn = basedOn
    validateObj.maxRequestNo = maxRequestNo

    const Result = await LeavePolicy.findByIdAndUpdate(_id, validateObj, {
        new: true,
    })
    if (Result) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
})

exports.leavePolicyDetail = catchAsync(async (req, res, next) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = { _id: mongoose.Types.ObjectId(req.body._id) }

    const data = await LeavePolicy.aggregate([
        { $match: condition },
        {
            $project: {
                name: '$name',
                code: '$code',
                color: '$color',
                type: '$type',
                basedOn: '$basedOn',
                unit: '$unit',
                description: '$description',
                leaveGrant: '$leaveGrant',
                entitleMent: '$entitleMent',
                applicable: '$applicable',
                companyId: '$companyId',
                createdById: '$createdById',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                maxRequestNo: '$maxRequestNo',
                isSandwich: '$isSandwich',
                isIncludeHoliday: '$isIncludeHoliday',
            },
        },
    ])
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})

exports.delete = softDelete(LeavePolicy)
exports.changeStatus = toggleStatus(LeavePolicy)
