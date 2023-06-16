const Response = require('../../../../../lib/response'),
    catchAsync = require('./../../../../../lib/catchAsync'),
    toggleDeletedState = require('./../../factory/update'),
    toggleStatus = require('./../../factory/changeStatus'),
    constants = require('./../../../../../lib/constants'),
    { getEncryptText, getDecryptText } = require('./../../../../../lib/utility'),
    softDelete = require('./../../factory/softDelete'),
    moment = require('moment'),
    { softwareValidation } = require('./../../../../../lib/joiValidation'),
    Software = require('./../models/software_model'),
    mailer = require('./../../../../../lib/mailer'),
    User = require('./../../user/models/user_model'),
    mongoose = require('mongoose')

exports.addSoftware = catchAsync(async (req, res, next) => {
    let validateObj = {
        provider: req.body.provider,
        type: req.body.type,
        purchasedOn: req.body.purchasedOn,
        billingAfter: req.body.billingAfter,
    }
    //To Prevent Dublicacy
    const softwareRes = await Software.findOne({
        productId: req.body.productId,
        companyId: req.body.companyId,
    })
    if (softwareRes) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))
    await softwareValidation.validateAsync(validateObj)

    const { createdById, companyId, systemNumber, progressBarLength, percentageData, costAndCurrency, userMail, productId, url, note, password } = req.body

    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))

    if (!companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))

    validateObj.createdById = createdById
    validateObj.companyId = companyId

    validateObj.progressBarLength = progressBarLength
    validateObj.percentageData = percentageData
    validateObj.password = getEncryptText(req.body.password)
    validateObj.costAndCurrency = costAndCurrency
    validateObj.userMail = userMail
    validateObj.productId = productId
    validateObj.url = url
    validateObj.note = note
    validateObj.password = password

    let nextPaymentDate
    if (systemNumber) {
        validateObj.systemNumber = systemNumber
    }

    switch (req.body.billingAfter.unit) {
        case 'MONTH': {
            nextPaymentDate = moment(req.body.purchasedOn).add(req.body.billingAfter.value, 'months')
            break
        }
        case 'YEAR': {
            nextPaymentDate = moment(req.body.purchasedOn).add(req.body.billingAfter.value, 'year')

            break
        }
        case 'WEEK': {
            nextPaymentDate = moment(req.body.purchasedOn).add(req.body.billingAfter.value, 'weeks')

            break
        }
    }
    validateObj.nextPaymentDate = nextPaymentDate

    let softwareInfo = await Software.create(validateObj)

    const { userId } = req.body
    let updatePercentage = await User.findByIdAndUpdate({ _id: userId }, { percentageData: req.body.percentageData })

    if (softwareInfo) {
        return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
    } else {
        return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    }
})
exports.softwareDetails = catchAsync(async (req, res, next) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = { _id: mongoose.Types.ObjectId(req.body._id) }

    const data = await Software.aggregate([{ $match: condition }])
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})
exports.softwareUpdate = catchAsync(async (req, res) => {
    const { _id } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let validateObj = {
        provider: req.body.provider,
        type: req.body.type,
        purchasedOn: req.body.purchasedOn,
        billingAfter: req.body.billingAfter,
        // costAndCurrency: req.body.costAndCurrency,
        // userMail: req.body.userMail,
        // productId: req.body.productId,
        // url: req.body.url,
        // note: req.body.note,
        // password: req.body.password,
    }

    await softwareValidation.validateAsync(validateObj)
    validateObj.password = getDecryptText(req.body.password)
    let nextPaymentDate

    switch (req.body.billingAfter.unit) {
        case 'MONTH': {
            nextPaymentDate = moment(req.body.purchasedOn).add(req.body.billingAfter.value, 'months')
            break
        }
        case 'YEAR': {
            nextPaymentDate = moment(req.body.purchasedOn).add(req.body.billingAfter.value, 'year')

            break
        }
        case 'WEEK': {
            nextPaymentDate = moment(req.body.purchasedOn).add(req.body.billingAfter.value, 'weeks')

            break
        }
    }
    validateObj.nextPaymentDate = nextPaymentDate

    const Result = await Software.findByIdAndUpdate(_id, validateObj, {
        new: true,
    })
    if (Result) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
})
exports.softwareList = catchAsync(async (req, res) => {
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
        child_condition.$or = [{ provider: new RegExp(searchText, 'gi') }]
    }

    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }
    if (req.body.createdById) condition.createdById = mongoose.Types.ObjectId(req.body.createdById)

    const data = await Software.aggregate([
        { $match: condition },
        {
            $project: {
                provider: '$provider',
                type: '$type',
                purchasedOn: '$purchasedOn',
                billingAfter: '$billingAfter',
                costAndCurrency: '$costAndCurrency',
                userMail: '$userMail',
                productId: '$productId',
                url: '$url',
                nextPaymentDate: '$nextPaymentDate',
                note: '$note',
                systemNumber: '$systemNumber',
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

    const totalCount = await Software.countDocuments({
        ...condition,
        ...child_condition,
    })

    if (data.length) {
        return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    } else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})
exports.softwareReminderCron = catchAsync(async (req, res) => {
    const newDate = new Date(moment(new Date()).add(5, 'days'))
    const newDate1 = new Date(moment(new Date()).add(4, 'days'))
    let condition = {}
    const expiredSoftware = await Software.aggregate([
        {
            $match: {
                $and: [{ nextPaymentDate: { $lte: newDate } }, { nextPaymentDate: { $gte: newDate1 } }],
            },
        },
        {
            $group: {
                _id: '$companyId',
                software: {
                    $push: {
                        provider: '$provider',
                        nextPaymentDate: '$nextPaymentDate',
                        userMail: '$userMail',
                        password: '$password',
                        productId: '$productId',
                        systemNumber: '$systemNumber',
                    },
                },
            },
        },
        {
            $lookup: {
                from: 'users',
                let: { userId: '$_id' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$userId'] } } }],
                as: 'companyInfo',
            },
        },
        { $unwind: { path: '$companyInfo', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                firstName: '$companyInfo.firstName',
                softwareArr: '$software',
            },
        },
    ])

    if (expiredSoftware.length) {
        expiredSoftware.forEach(async (el) => {
            const printContents = {
                softwareArr: el.softwareArr,
            }
            const options = {
                to: ['npahwa2312@gmail.com', 'jitendra@zimo.one'],
                subject: 'Software expire',
            }
            const mailResponse = await mailer.softwareCronNotificationEmail(options, printContents)
        })
    }
})

exports.delete = softDelete(Software)
exports.changeStatus = toggleStatus(Software)
