const Response = require('../../../../../lib/response'),
    catchAsync = require('../../../../../lib/catchAsync'),
    toggleDeletedState = require('../../factory/update'),
    toggleStatus = require('../../factory/changeStatus'),
    constants = require('../../../../../lib/constants'),
    softDelete = require('../../factory/softDelete'),
    { projectValidation } = require('../../../../../lib/joiValidation'),
    mailer = require('../../../../../lib/mailer'),
    ProjectStatus = require('../models/projectStatus_model')
mongoose = require('mongoose')

exports.ProjectStatusAdd = catchAsync(async (req, res, next) => {
    let validateObj = {
        status: req.body.status,
    }

    const userRes = await ProjectStatus.findOne({
        status: req.body.status,
    })
    if (userRes) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))
    const { createdById, companyId } = req.body

    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))
    if (!companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))

    validateObj.createdById = createdById
    validateObj.companyId = companyId

    let StatusInfo = await ProjectStatus.create(validateObj)

    if (StatusInfo) {
        return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
    } else {
        return res.json(Response(constants.statusCode.internalServerError, constants.statusCode.internalError))
    }
})
exports.projectStatusList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 10
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)

    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { status: 1 }
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

    const data = await ProjectStatus.aggregate([
        { $match: condition },

        {
            $project: {
                status: '$status',
                _id: '$_id',
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await ProjectStatus.countDocuments({
        ...condition,
        ...child_condition,
    })
    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})
exports.projectStatusDetails = catchAsync(async (req, res, next) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = { _id: mongoose.Types.ObjectId(req.body._id) }

    const data = await ProjectStatus.aggregate([
        { $match: condition },

        {
            $project: {
                status: '$status',
            },
        },
    ])
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})
exports.projectStatusUpdate = catchAsync(async (req, res) => {
    const { _id } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    let validateObj = {
        status: req.body.status,
    }

    const Result = await ProjectStatus.findByIdAndUpdate(_id, validateObj, {
        new: true,
    })

    if (Result) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
})
