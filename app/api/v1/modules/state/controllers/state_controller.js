const Response = require('../../../../../lib/response'),
    catchAsync = require('./../../../../../lib/catchAsync'),
    toggleDeletedState = require('./../../factory/update'),
    toggleStatus = require('./../../factory/changeStatus'),
    constants = require('./../../../../../lib/constants'),
    // toggleDeletedRole = require('./../../factory/update'),
    query = require('./../../../../../lib/common_query'),
    softDelete = require('./../../factory/softDelete'),
    { stateValidation } = require('./../../../../../lib/joiValidation'),
    State = require('./../models/state_model'),
    mongoose = require('mongoose')

exports.addState = catchAsync(async (req, res, next) => {
    let validateObj = {
        title: req.body.title,
    }

    //To Prevent Dublicacy
    const stateRes = await State.findOne({
        createdById: req.body.createdById,
        title: req.body.title,
    })
    if (stateRes) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))
    await stateValidation.validateAsync(validateObj)

    const { countryId, createdById } = req.body

    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    if (!countryId) return res.json(Response(constants.statusCode.unauth, constants.messages.countryId))

    validateObj.createdById = createdById
    validateObj.countryId = countryId

    let stateInfo = await State.create(validateObj)
    if (stateInfo) {
        return res.json(Response(constants.statusCode.ok, constants.stateMsg.addState))
    } else {
        return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    }
})

exports.stateDetails = catchAsync(async (req, res, next) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = { _id: mongoose.Types.ObjectId(req.body._id) }

    const data = await State.aggregate([
        { $match: condition },

        {
            $project: {
                title: '$title',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                createdById: '$createdById',
                countryId: '$countryId',
            },
        },
    ])
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})

exports.stateUpdate = catchAsync(async (req, res) => {
    const { _id, countryId } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    let validateObj = {
        title: req.body.title,
    }

    await stateValidation.validateAsync(validateObj)

    if (!countryId) return res.json(Response(constants.statusCode.unauth, constants.messages.countryId))

    validateObj.countryId = countryId

    const Result = await State.findByIdAndUpdate(_id, validateObj, {
        new: true,
    })
    if (Result) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
})

exports.stateList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 10
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
        child_condition.$or = [{ countryName: new RegExp(searchText, 'gi') }, { Title: new RegExp(searchText, 'gi') }]
    }
    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }
    if (req.body.countryId) condition.countryId = mongoose.Types.ObjectId(req.body.countryId)
    if (req.body.createdById) condition.createdById = mongoose.Types.ObjectId(req.body.createdById)
    const data = await State.aggregate([
        { $match: condition },

        {
            $lookup: {
                from: 'countries',
                localField: 'countryId',
                foreignField: '_id',
                as: 'countryData',
            },
        },
        { $unwind: { path: '$countryData', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                countryName: '$countryData.title',
                countryId: '$countryData._id',
                Title: '$title',
                count_id: '$countryId',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])

    const totalCount = await State.countDocuments({
        ...condition,
        ...child_condition,
    })
    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

exports.deleteState = softDelete(State)
exports.changeStatus = toggleStatus(State)
