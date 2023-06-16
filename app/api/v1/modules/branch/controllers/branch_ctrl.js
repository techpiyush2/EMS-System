const Response = require('../../../../../lib/response'),
    catchAsync = require('../../../../../lib/catchAsync'),
    toggleDeletedState = require('../../factory/update'),
    toggleStatus = require('../../factory/changeStatus'),
    constants = require('../../../../../lib/constants'),
    // toggleDeletedRole = require('./../../factory/update'),
    query = require('../../../../../lib/common_query'),
    softDelete = require('../../factory/softDelete'),
    { branchValidation } = require('../../../../../lib/joiValidation'),
    Branch = require('../models/branch_model'),
    mongoose = require('mongoose')
const User = require('../../user/models/user_model')

exports.addBranch = catchAsync(async (req, res, next) => {
    const isExist = await Branch.findOne({
        branchCode: req.body.branchCode,

        createdById: req.body.createdById,
    })
    if (isExist) return res.json(Response(constants.statusCode.unauth, constants.messages.codeExist))
    let validateObj = {
        branchCode: req.body.branchCode,
        branchName: req.body.branchName,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
    }

    await branchValidation.validateAsync(validateObj)

    const { createdById, companyId, dateOfFoundation, progressBarLength, percentageData } = req.body

    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))
    if (!companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))
    validateObj.companyId = companyId
    validateObj.createdById = createdById
    validateObj.dateOfFoundation = dateOfFoundation

    let branchInfo = await Branch.create(validateObj)

    const { userId } = req.body
    let updatePercentage = await User.findByIdAndUpdate({ _id: userId }, { isAddBranch: true, percentageData: req.body.percentageData })
    if (branchInfo) {
        return res.json(Response(constants.statusCode.ok, constants.branchMsg.addBranch))
    } else {
        return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    }
})
exports.branchDetails = catchAsync(async (req, res, next) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = { _id: mongoose.Types.ObjectId(req.body._id) }

    const data = await Branch.aggregate([
        { $match: condition },
        {
            $project: {
                branchCode: '$branchCode',
                branchName: '$branchName',
                address: '$address',
                phone: '$phone',
                email: '$email',
                dateOfFoundation: '$dateOfFoundation',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                createdById: '$createdById',
                companyId: '$companyId',
            },
        },
    ])
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})
exports.branchUpdate = catchAsync(async (req, res) => {
    const { _id } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let validateObj = {
        branchCode: req.body.branchCode,
        branchName: req.body.branchName,
        address: req.body.address,
        phone: req.body.phone,
        email: req.body.email,
    }

    await branchValidation.validateAsync(validateObj)
    const { dateOfFoundation } = req.body
    validateObj.dateOfFoundation = dateOfFoundation
    const Result = await Branch.findByIdAndUpdate(_id, validateObj, {
        new: true,
    })
    if (Result) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
})
exports.branchList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 10
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)

    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { branchName: 1 }
    }
    let child_condition = {}
    let condition = {}
    if (req.body.isActive != '' && req.body.isActive != undefined) {
        condition.isActive = req.body.isActive == 'true' ? true : false
    }
    const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')
    if (req.body.searchText) {
        child_condition.$or = [{ branchName: new RegExp(searchText, 'gi') }]
    }

    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }

    if (req.body.createdById) condition.createdById = mongoose.Types.ObjectId(req.body.createdById)
    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
    const data = await Branch.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'companies',
                localField: 'createdById',
                foreignField: 'createdById',
                as: 'companyData',
            },
        },

        { $unwind: { path: '$companyData', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                branchCode: '$branchCode',
                headOfficeAdd: '$companyData.headOfficeAdd',
                branchName: '$branchName',
                address: '$address',
                phone: '$phone',
                email: '$email',
                dateOfFoundation: '$dateOfFoundation',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                createdById: '$createdById',
                companyId: '$companyId',
                isShift: 1,
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await Branch.countDocuments({
        ...condition,
        ...child_condition,
    })
    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

exports.shiftWiseLocationList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : constants.settings.count
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)
    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { _id: -1 }
    }
    let child_condition = {}
    let condition = {}

    if (req.body.isActive != '' && req.body.isActive != undefined) {
        condition.isActive = req.body.isActive == 'true' ? true : false
    }
    const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')
    if (req.body.searchText) {
        condition.$or = [{ title: new RegExp(searchText, 'gi') }]
    }

    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)

    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }

    const data = await Branch.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'shifts',
                let: { branch_id: '$_id' },
                pipeline: [{ $match: { $expr: { $eq: ['$branchId', '$$branch_id'] } } }, { $project: { code: 1, name: 1 } }],
                as: 'shiftInfo',
            },
        },
        { $project: { branchCode: '$branchCode', branchName: '$branchName', shiftsArr: '$shiftInfo' } },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])

    const totalCount = await Branch.countDocuments({
        ...condition,
        ...child_condition,
    })

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

exports.deleteBranch = softDelete(Branch)
exports.changeStatus = toggleStatus(Branch)
