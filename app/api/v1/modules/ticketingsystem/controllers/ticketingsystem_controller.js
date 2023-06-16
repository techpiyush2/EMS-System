const Response = require('../../../../../lib/response'),
    catchAsync = require('./../../../../../lib/catchAsync'),
    toggleStatus = require('./../../factory/changeStatus'),
    constants = require('./../../../../../lib/constants'),
    query = require('./../../../../../lib/common_query'),
    whoweare = require('../models/whoweare_model'),
    mongoose = require('mongoose')


exports.addwhoweare = catchAsync(async (req, res, next) => {
    let validateObj = {
        title: req.body.title,
    }
    const userRes = await Skills.findOne({
        title: req.body.title,
        companyId: req.body.companyId,
        createdById: req.body.createdById,
    })
    if (userRes) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))
    await skillsValidation.validateAsync(validateObj)
    const { createdById, progressBarLength, percentageData } = req.body

    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))

    validateObj.createdById = createdById
    validateObj.progressBarLength = progressBarLength
    validateObj.percentageData = percentageData

    let skillsInfo = await Skills.create(validateObj)
    const { userId } = req.body

    let updatePercentage = await User.findByIdAndUpdate({ _id: userId }, { percentageData: req.body.percentageData })

    if (skillsInfo) {
        return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
    } else {
        return res.json(Response(constants.statusCode.internalServerError, constants.statusCode.internalError))
    }
})

// exports.ticketDetails = catchAsync(async (req, res, next) => {
//     if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
//     let condition = { _id: mongoose.Types.ObjectId(req.body._id) }

//     const data = await Skills.aggregate([
//         { $match: condition },
//         {
//             $project: {
//                 title: '$title',

//                 isActive: '$isActive',
//                 isDeleted: '$isDeleted',
//                 createdById: '$createdById',
//                 companyId: '$companyId',
//             },
//         },
//     ])
//     if (data.length == 0) return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
//     else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
// })

exports.whowearelist = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 10
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)

    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { title: -1 }
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

    const data = await Skills.aggregate([
        { $match: condition },

        {
            $lookup: {
                from: 'employees',
                let: { skill_Id: '$_id' },
                pipeline: [{ $match: { $expr: { $in: ['$$skill_Id', '$skills'] } } }],
                as: 'employeeData',
            },
        },

        {
            $project: {
                title: '$title',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                createdById: '$createdById',
                companyId: '$companyId',
                employeeData: { $size: '$employeeData.skills' },
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await Skills.countDocuments({
        ...condition,
        ...child_condition,
    })

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})
exports.whowearechangeStatus = toggleStatus(Skills)
