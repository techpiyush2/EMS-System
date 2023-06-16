const Response = require('../../../../../lib/response'),
    catchAsync = require('./../../../../../lib/catchAsync'),
    // toggleDeletedState = require("./../../factory/update"),
    toggleStatus = require('./../../factory/changeStatus'),
    constants = require('./../../../../../lib/constants'),
    // toggleDeletedRole = require('./../../factory/update'),
    query = require('./../../../../../lib/common_query'),
    softDelete = require('./../../factory/softDelete'),
    { domainValidation } = require('../../../../../lib/joiValidation'),
    { domainUpdateValidation } = require('./../../../../../lib/joiValidation'),
    User = require('./../../user/models/user_model'),
    Domain = require('./../models/domain_model'),
    mongoose = require('mongoose')

exports.addDomain = catchAsync(async (req, res, next) => {
    let validateObj = {
        title: req.body.title,
        description: req.body.description,
    }

    //To Prevent Dublicacy
    const domainRes = await Domain.findOne({ title: req.body.title, companyId: req.body.companyId })
    if (domainRes) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))

    await domainValidation.validateAsync(validateObj)

    const { createdById, companyId, progressBarLength, percentageData } = req.body

    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))
    if (!companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))

    validateObj.createdById = createdById
    validateObj.companyId = companyId

    let domainInfo = await Domain.create(validateObj)
    const { userId } = req.body

    let updatePercentage = await User.findByIdAndUpdate({ _id: userId }, { isAddDomain: true, percentageData: req.body.percentageData })

    if (domainInfo) {
        return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
    } else {
        return res.json(Response(constants.statusCode.internalServerError, constants.statusCode.internalError))
    }
})

exports.domainDetails = catchAsync(async (req, res, next) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = { _id: mongoose.Types.ObjectId(req.body._id) }

    const data = await Domain.aggregate([
        { $match: condition },
        {
            $project: {
                title: '$title',
                description: '$description',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                createdById: '$createdById',
                companyId: '$companyId',
            },
        },
    ])
    if (data.length == 0) return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})

exports.domainEdit = catchAsync(async (req, res) => {
    const { _id } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    let validateObj = {
        title: req.body.title,
        description: req.body.description,
    }

    await domainValidation.validateAsync(validateObj)

    const domainObj = {
        title: req.body.title,
        description: req.body.description,
    }

    const Result = await Domain.findByIdAndUpdate(_id, domainObj, { new: true })

    if (Result) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
})

exports.domainList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 10
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)

    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { title: 1 }
    }
    let child_condition = {}
    let condition = {}
    if (req.body.isActive != '' && req.body.isActive != undefined) {
        condition.isActive = req.body.isActive == 'true' ? true : false
    }
    const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')
    if (req.body.searchText) {
        child_condition.$or = [{ title: new RegExp(searchText, 'gi') }]
    }

    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }
    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
    if (req.body.createdById) condition.createdById = mongoose.Types.ObjectId(req.body.createdById)

    const data = await Domain.aggregate([
        { $match: condition },
        {
            $project: {
                title: '$title',
                description: '$description',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                createdById: '$createdById',
                companyId: '$companyId',
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await Domain.countDocuments({
        ...condition,
        ...child_condition,
    })

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

exports.delete = softDelete(Domain)
exports.changeStatus = toggleStatus(Domain)
