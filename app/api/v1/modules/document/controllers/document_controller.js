'use strict'

const Response = require('../../../../../lib/response'),
    catchAsync = require('./../../../../../lib/catchAsync'),
    toggleStatus = require('./../../factory/changeStatus'),
    constants = require('./../../../../../lib/constants'),
    query = require('./../../../../../lib/common_query'),
    softDelete = require('./../../factory/softDelete'),
    { documentValidation } = require('./../../../../../lib/joiValidation'),
    Document = require('../models/document_model'),
    mongoose = require('mongoose')

exports.documentAdd = catchAsync(async (req, res, next) => {
    let validateObj = {
        title: req.body.title,
    }
    const userRes = await Document.findOne({
        title: req.body.title,
    })
    if (userRes) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))

    await documentValidation.validateAsync(validateObj)
    const { createdById } = req.body

    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))

    validateObj.createdById = createdById

    let documentInfo = await Document.create(validateObj)

    if (documentInfo) {
        return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
    } else {
        return res.json(Response(constants.statusCode.internalError, constants.messages.internalServerError))
    }
})

exports.documentList = catchAsync(async (req, res) => {
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
    if (req.body.createdById) condition.createdById = mongoose.Types.ObjectId(req.body.createdById)
    const data = await Document.aggregate([
        { $match: condition },
        {
            $project: {
                title: '$title',
                createdById: '$createdById',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await Document.countDocuments({
        ...condition,
        ...child_condition,
    })
    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})
exports.documentUpdate = catchAsync(async (req, res) => {
    const { _id } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    let validateObj = {
        title: req.body.title,
    }

    await documentValidation.validateAsync(validateObj)

    const Result = await Document.findByIdAndUpdate(_id, validateObj, {
        new: true,
    })
    if (Result) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
})
exports.documentDetail = catchAsync(async (req, res, next) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = { _id: mongoose.Types.ObjectId(req.body._id) }
    const data = await Document.aggregate([
        { $match: condition },
        {
            $project: {
                title: '$title',
                createdById: '$createdById',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
            },
        },
    ])
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})

exports.changeStatus = toggleStatus(Document)

exports.delete = softDelete(Document)
