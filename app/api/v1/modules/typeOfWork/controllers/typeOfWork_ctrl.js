const Response = require('../../../../../lib/response'),
    catchAsync = require('./../../../../../lib/catchAsync'),
    toggleDeletedState = require('./../../factory/update'),
    toggleStatus = require('./../../factory/changeStatus'),
    constants = require('./../../../../../lib/constants'),
    query = require('./../../../../../lib/common_query'),
    softDelete = require('./../../factory/softDelete'),
    { typeOfWorkValidation } = require('./../../../../../lib/joiValidation'),
    TypeOfWork = require('./../models/typeOfWork_model'),
    mongoose = require('mongoose')
const User = require('../../user/models/user_model')

exports.addTypeOfWork = catchAsync(async (req, res, next) => {
    const isExist = await TypeOfWork.findOne({
        title: req.body.title,
        companyId: req.body.companyId,
    })
    if (isExist) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))
    let validateObj = {
        title: req.body.title,
    }
    await typeOfWorkValidation.validateAsync(validateObj)

    const { companyId } = req.body

    if (!companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))
    validateObj.companyId = companyId

    let typeOfWorkInfo = await TypeOfWork.create(validateObj)

    if (typeOfWorkInfo) {
        return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
    } else {
        return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
    }
})

exports.typeOfWorkDetails = catchAsync(async (req, res, next) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = { _id: mongoose.Types.ObjectId(req.body._id) }

    const data = await TypeOfWork.aggregate([
        { $match: condition },
        {
            $project: {
                title: '$title',
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

exports.TypeOfWorkUpdate = catchAsync(async (req, res) => {
    const { _id } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let validateObj = {
        title: req.body.title,
    }

    await typeOfWorkValidation.validateAsync(validateObj)

    const Result = await TypeOfWork.findByIdAndUpdate(_id, validateObj, {
        new: true,
    })
    if (Result) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
})

exports.TypeOfWorkList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 100
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
        child_condition.$or = [{ title: new RegExp(searchText, 'gi') }]
    }

    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }

    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)

    const data = await TypeOfWork.aggregate([
        { $match: condition },
        {
            $project: {
                title: '$title',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                companyId: '$companyId',
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await TypeOfWork.countDocuments({
        ...condition,
        ...child_condition,
    })
    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

// exports.delete = softDelete(Department)
exports.changeStatus = toggleStatus(TypeOfWork)
