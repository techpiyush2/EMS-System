const { required } = require('joi')

const Response = require('../../../../../lib/response'),
    catchAsync = require('./../../../../../lib/catchAsync'),
    // toggleDeletedState = require("./../../factory/update"),
    toggleStatus = require('./../../factory/changeStatus'),
    constants = require('./../../../../../lib/constants'),
    // toggleDeletedRole = require('./../../factory/update'),
    query = require('./../../../../../lib/common_query'),
    // shortid = require("shortid"),
    softDelete = require('./../../factory/softDelete'),
    { companyValidation } = require('./../../../../../lib/joiValidation'),
    // { domainUpdateValidation } = require("./../../../../../lib/joiValidation"),
    User = require('../../user/models/user_model'),
    Company = require('./../models/company_model'),
    mongoose = require('mongoose')

exports.addCompany = catchAsync(async (req, res, next) => {
    let validateObj = {
        companyName: req.body.companyName,
        headOfficeAdd: req.body.headOfficeAdd,
        mobileNumber: req.body.mobileNumber,
        email: req.body.email,
    }

    const userRes = await User.findOne({
        email: req.body.email,
    })
    if (userRes) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))

    if (!req.body.email) return res.json(Response(constants.statusCode.unauth, constants.company.email))
    if (!req.body.companyName) return res.json(Response(constants.statusCode.unauth, constants.company.nameReq))
    if (!req.body.mobileNumber) return res.json(Response(constants.statusCode.unauth, constants.company.mobileNumber))

    let companyInfo = await Company.create(validateObj)

    if (!companyInfo) {
        return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
    } else {
        return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
    }
})

exports.companyDetails = catchAsync(async (req, res, next) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = { createdById: mongoose.Types.ObjectId(req.body._id) }

    const data = await Company.aggregate([
        { $match: condition },
        {
            $project: {
                corporateId: '$corporateId',
                companyName: '$companyName',
                headOfficeAdd: '$headOfficeAdd',
                mobileNumber: '$mobileNumber',
                email: '$email',
                website: '$website',
                multipleLocation: '$multipleLocation',
                dateOfFoundation: '$dateOfFoundation',
                gst: '$gst',
                esi: '$esi',
                pan: '$pan',
                tan: '$tan',
                logo: '$logo',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                createdById: '$createdById',
            },
        },
    ])

    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})

exports.companyEdit = catchAsync(async (req, res) => {
    const { userId, _id } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    let validateObj = {
        companyName: req.body.companyName,
        logo: req.body.logo,
        headOfficeAdd: req.body.headOfficeAdd,
        mobileNumber: req.body.mobileNumber,
        email: req.body.email,
        website: req.body.website,
        multipleLocation: req.body.multipleLocation,
        dateOfFoundation: new Date(req.body.dateOfFoundation),
        gst: req.body.gst,
        esi: req.body.esi,
        pan: req.body.pan,
        tan: req.body.tan,
    }

    if (!req.body.email) return res.json(Response(constants.statusCode.unauth, constants.company.email))

    if (!req.body.headOfficeAdd) return res.json(Response(constants.statusCode.unauth, constants.company.headOfficeAdd))
    if (!req.body.mobileNumber) return res.json(Response(constants.statusCode.unauth, constants.company.mobileNumber))

    const Result = await Company.findByIdAndUpdate(_id, validateObj, {
        new: true,
    })
    const { progressBarLength, percentageData } = req.body
    validateObj.progressBarLength = progressBarLength
    validateObj.percentageData = percentageData

    const inviteObj = await User.findByIdAndUpdate(userId, {
        isCompleted: true,percentageData: req.body.percentageData
    })

    if (Result || inviteObj) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
})

exports.companyList = catchAsync(async (req, res) => {
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
    let condition = { isActive: true }
    if (req.body.isActive != '' && req.body.isActive != undefined) {
        condition.isActive = req.body.isActive == 'true' ? true : false
    }

    const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')
    if (req.body.searchText) {
        child_condition.$or = [{ companyName: new RegExp(searchText, 'gi') }]
        if (req.body.isAccepted) {
            child_condition.$or = [{ ACCEPTED: new RegExp(searchText, 'gi') }, { PENDING: new RegExp(searchText, 'gi') }, { DECLINE: new RegExp(searchText, 'gi') }, { date: new RegExp(searchText, 'gi') }]
        }
    }
    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }

    if (req.body.createdById) {
        condition.createdById = mongoose.Types.ObjectId(req.body.createdById)
    }

    const data = await Company.aggregate([{ $match: condition }, { $match: child_condition }, { $sort: sortObject }, { $limit: parseInt(skip) + parseInt(count) }, { $skip: parseInt(skip) }])
    const totalCount = await Company.countDocuments({
        ...condition,
        ...child_condition,
    })

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

exports.deleteCompany = softDelete(Company)
exports.changeStatus = toggleStatus(Company)
