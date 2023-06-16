const Response = require('../../../../../lib/response'),
    catchAsync = require('./../../../../../lib/catchAsync'),
    toggleStatus = require('./../../factory/changeStatus'),
    constants = require('./../../../../../lib/constants'),
    query = require('./../../../../../lib/common_query'),
    softDelete = require('./../../factory/softDelete'),
    { shiftsValidation, shiftsUpdateValidation } = require('./../../../../../lib/joiValidation'),
    Shifts = require('./../models/shifts_model'),
    Branch = require('./../../branch/models/branch_model'),
    User = require('../../user/models/user_model'),
    mongoose = require('mongoose')

exports.addShifts = catchAsync(async (req, res, next) => {
    let validateObj = {
        code: req.body.code,
        name: req.body.name,
        color: req.body.color,
        timeZone: req.body.timeZone,
        calculateHours: req.body.calculateHours,
    }
    // req.body.sessions.second.inTime = req.body.sessions.second.inTime ? parseFloat(req.body.sessions.second.inTime.replace(':', '.')) : 0.0
    // req.body.sessions.second.outTime = req.body.sessions.second.outTime ? parseFloat(req.body.sessions.second.outTime.replace(':', '.')) : 0.0
    // req.body.sessions.second.graceIn = req.body.sessions.second.graceIn ? parseFloat(req.body.sessions.second.graceIn) : 0.0
    // req.body.sessions.second.graceOut = req.body.sessions.second.graceOut ? parseFloat(req.body.sessions.second.graceOut) : 0.0
    // req.body.sessions.second.inMargin = req.body.sessions.second.inMargin ? parseFloat(req.body.sessions.second.inMargin) : 0.0
    // req.body.sessions.second.outMargin = req.body.sessions.second.outMargin ? parseFloat(req.body.sessions.second.outMargin) : 0.0

    // req.body.sessions.first.inTime = req.body.sessions.first.inTime ? parseFloat(req.body.sessions.first.inTime.replace(':', '.')) : 0.0
    // req.body.sessions.first.outTime = req.body.sessions.first.outTime ? parseFloat(req.body.sessions.first.outTime.replace(':', '.')) : 0.0
    // req.body.sessions.first.graceIn = req.body.sessions.first.graceIn ? parseFloat(req.body.sessions.first.graceIn) : 0.0
    // req.body.sessions.first.graceOut = req.body.sessions.first.graceOut ? parseFloat(req.body.sessions.first.graceOut) : 0.0
    // req.body.sessions.first.inMargin = req.body.sessions.first.inMargin ? parseFloat(req.body.sessions.first.inMargin) : 0.0
    // req.body.sessions.first.outMargin = req.body.sessions.first.outMargin ? parseFloat(req.body.sessions.first.outMargin) : 0.0

    // req.body.sessions.first.inTime = moment(new Date(req.body.sessions.first.inTime)).utc()
    // console.log(req.body.sessions.first.inTime, '  req.body.sessions.first.inTime')
    // req.body.sessions.second.inTime ? parseFloat(req.body.sessions.second.inTime.replace(':', '.')) : 0.0
    // req.body.sessions.second.outTime = req.body.sessions.second.outTime ? parseFloat(req.body.sessions.second.outTime.replace(':', '.')) : 0.0
    // req.body.sessions.second.graceIn = req.body.sessions.second.graceIn ? parseFloat(req.body.sessions.second.graceIn) : 0.0
    // req.body.sessions.second.graceOut = req.body.sessions.second.graceOut ? parseFloat(req.body.sessions.second.graceOut) : 0.0
    // req.body.sessions.second.inMargin = req.body.sessions.second.inMargin ? parseFloat(req.body.sessions.second.inMargin) : 0.0
    // req.body.sessions.second.outMargin = req.body.sessions.second.outMargin ? parseFloat(req.body.sessions.second.outMargin) : 0.0

    // req.body.sessions.first.inTime = req.body.sessions.first.inTime ? parseFloat(req.body.sessions.first.inTime.replace(':', '.')) : 0.0
    // req.body.sessions.first.outTime = req.body.sessions.first.outTime ? parseFloat(req.body.sessions.first.outTime.replace(':', '.')) : 0.0
    // req.body.sessions.first.graceIn = req.body.sessions.first.graceIn ? parseFloat(req.body.sessions.first.graceIn) : 0.0
    // req.body.sessions.first.graceOut = req.body.sessions.first.graceOut ? parseFloat(req.body.sessions.first.graceOut) : 0.0
    // req.body.sessions.first.inMargin = req.body.sessions.first.inMargin ? parseFloat(req.body.sessions.first.inMargin) : 0.0
    // req.body.sessions.first.outMargin = req.body.sessions.first.outMargin ? parseFloat(req.body.sessions.first.outMargin) : 0.0

    await shiftsValidation.validateAsync(validateObj)
    const { createdById, companyId, branchId, days, progressBarLength, percentageData } = req.body

    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))
    if (!companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))
    if (!branchId) return res.json(Response(constants.statusCode.unauth, constants.messages.branchId))
    if (!days) return res.json(Response(constants.statusCode.unauth, constants.shiftMsg.days))
    let sessions = req.body.sessions
    const sessionSecond = req.body.sessions

    let fullDay = req.body.fullDay
    let halfDay = req.body.halfDay

    if (!req.body.sessions.first.inTime) return res.json(Response(constants.statusCode.unauth, constants.shiftMsg.sessionsFirst))
    if (!req.body.sessions.second.outTime) return res.json(Response(constants.statusCode.unauth, constants.shiftMsg.sessionSecond))
    if (!req.body.fullDay) return res.json(Response(constants.statusCode.unauth, constants.shiftMsg.fullDay))
    if (!req.body.halfDay) return res.json(Response(constants.statusCode.unauth, constants.shiftMsg.halfDay))

    validateObj.createdById = createdById
    validateObj.companyId = companyId
    validateObj.branchId = branchId
    validateObj.days = days
    validateObj.sessions = sessions
    // validateObj.sessionSecond = sessionSecond
    validateObj.fullDay = parseFloat((fullDay * 60).toFixed(2))
    validateObj.halfDay = parseFloat((halfDay * 60).toFixed(2))

    console.log(validateObj, 'validateObj===================')

    // return false

    let shiftsInfo = await Shifts.create(validateObj)
    console.log('shiftsInfo', shiftsInfo)
    const { userId } = req.body

    let updatePercentage = await User.findByIdAndUpdate({ _id: userId }, { isAddShift: true, percentageData: req.body.percentageData })
    let updateBranch = await Branch.findByIdAndUpdate({ _id: validateObj.branchId }, { isShift: true })

    if (shiftsInfo) {
        return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
    } else {
        return res.json(Response(constants.statusCode.internalServerError, constants.statusCode.internalError))
    }
})

exports.shiftsDetails = catchAsync(async (req, res, next) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = { _id: mongoose.Types.ObjectId(req.body._id), isActive: true }

    const data = await Shifts.aggregate([
        { $match: condition },
        {
            $project: {
                code: '$code',
                name: '$name',
                color: '$color',
                timeZone: '$timeZone',
                calculateHours: '$calculateHours',
                sessions: '$sessions',
                fullDay: '$fullDay',
                halfDay: '$halfDay',
                days: '$days',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                createdById: '$createdById',
                companyId: '$companyId',
                branchId: '$branchId',
            },
        },
    ])
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})

exports.shiftsUpdate = catchAsync(async (req, res) => {
    const { _id } = req.body
    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    // req.body.sessions.second.inTime = req.body.sessions.second.inTime && typeof req.body.sessions.second.inTime == 'string' ? parseFloat(req.body.sessions.second.inTime.replace(':', '.')) : req.body.sessions.second.inTime
    // req.body.sessions.second.outTime = req.body.sessions.second.outTime && typeof req.body.sessions.second.outTime == 'string' ? parseFloat(req.body.sessions.second.outTime.replace(':', '.')) : req.body.sessions.second.outTime
    // req.body.sessions.second.graceIn = req.body.sessions.second.graceIn && typeof req.body.sessions.second.graceIn == 'string' ? parseFloat(req.body.sessions.second.graceIn) : req.body.sessions.second.graceIn
    // req.body.sessions.second.graceOut = req.body.sessions.second.graceOut && typeof req.body.sessions.second.graceOut == 'string' ? parseFloat(req.body.sessions.second.graceOut) : req.body.sessions.second.graceOut
    // req.body.sessions.second.inMargin = req.body.sessions.second.inMargin && typeof req.body.sessions.second.inMargin == 'string' ? parseFloat(req.body.sessions.second.inMargin) : req.body.sessions.second.inMargin
    // req.body.sessions.second.outMargin = req.body.sessions.second.outMargin && typeof req.body.sessions.second.outMargin == 'string' ? parseFloat(req.body.sessions.second.outMargin) : req.body.sessions.second.outMargin

    // req.body.sessions.first.inTime = req.body.sessions.first.inTime && typeof req.body.sessions.first.inTime == 'string' ? parseFloat(req.body.sessions.first.inTime.replace(':', '.')) : req.body.sessions.first.inTime
    // req.body.sessions.first.outTime = req.body.sessions.first.outTime && typeof req.body.sessions.first.outTime == 'string' ? parseFloat(req.body.sessions.first.outTime.replace(':', '.')) : req.body.sessions.first.outTime
    // req.body.sessions.first.graceIn = req.body.sessions.first.graceIn && typeof req.body.sessions.first.graceIn == 'string' ? parseFloat(req.body.sessions.first.graceIn) : req.body.sessions.first.graceIn
    // req.body.sessions.first.graceOut = req.body.sessions.first.graceOut && typeof req.body.sessions.first.graceOut == 'string' ? parseFloat(req.body.sessions.first.graceOut) : req.body.sessions.first.graceOut
    // req.body.sessions.first.inMargin = req.body.sessions.first.inMargin && typeof req.body.sessions.first.inMargin == 'string' ? parseFloat(req.body.sessions.first.inMargin) : req.body.sessions.first.inMargin
    // req.body.sessions.first.outMargin = req.body.sessions.first.outMargin && typeof req.body.sessions.first.outMargin == 'string' ? parseFloat(req.body.sessions.first.outMargin) : req.body.sessions.first.outMargin

    let validateObj = {
        code: req.body.code,
        name: req.body.name,
        color: req.body.color,
        timeZone: req.body.timeZone,
        calculateHours: req.body.calculateHours,
        sessions: req.body.sessions,
        branchId: req.body.branchId,
        fullDay: req.body.fullDay,
        halfDay: req.body.halfDay,
        days: req.body.days,
    }

    await shiftsUpdateValidation.validateAsync(validateObj)

    const Result = await Shifts.findByIdAndUpdate(_id, validateObj, {
        new: true,
    })

    if (Result) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
})

exports.shiftsList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 10
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)

    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { name: -1 }
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

    if (req.body.createdById) condition.createdById = mongoose.Types.ObjectId(req.body.createdById)
    if (req.body.branchId) condition.branchId = mongoose.Types.ObjectId(req.body.branchId)

    const data = await Shifts.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'branches',
                localField: 'branchId',
                foreignField: '_id',
                as: 'branchData',
            },
        },
        { $unwind: { path: '$branchData', preserveNullAndEmptyArrays: true } },

        {
            $project: {
                code: '$code',
                name: '$name',
                color: '$color',
                fullDay: '$fullDay',
                halfDay: '$halfDay',
                branchId: '$branchId',
                isActive: '$isActive',
                timeZone: '$timeZone',
                companyId: '$companyId',
                isDeleted: '$isDeleted',
                createdById: '$createdById',
                inTime: '$sessions.first.inTime',
                calculateHours: '$calculateHours',
                outTime: '$sessions.second.outTime',
                branchName: '$branchData.branchName',
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await Shifts.countDocuments({
        ...condition,
        ...child_condition,
    })

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

exports.shiftLocationDetails = catchAsync(async (req, res) => {
    if (!req.body.branchId) return res.json(Response(constants.statusCode.unauth, constants.messages.branchId))

    const arr = []
    req.body.branchId.forEach((el) => (el = arr.push(mongoose.Types.ObjectId(el))))

    const condition = {
        branchId: { $in: arr },
        isActive: true,
    }
    const data = await Shifts.aggregate([
        { $match: condition },
        {
            $group: {
                _id: '$branchId',
                shifts: {
                    $push: {
                        branchId: '$branchId',
                        isActive: '$isActive',
                        name: '$name',
                        code: '$code',
                        _id: '$_id',
                        createdById: '$createdById',
                        companyId: '$companyId',
                    },
                },
            },
        },

        {
            $lookup: {
                from: 'branches',
                localField: '_id',
                foreignField: '_id',
                as: 'branchesInfo',
            },
        },
        { $unwind: { path: '$branchesInfo', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                branchName: '$branchesInfo.branchName',
                branchCode: '$branchesInfo.branchCode',
                shiftsArr: '$shifts',
            },
        },
    ])

    const totalCount = await Shifts.countDocuments({
        ...condition,
    })
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
})

exports.shiftLeaveList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 10
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)

    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { name: -1 }
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

    if (req.body.createdById) condition.createdById = mongoose.Types.ObjectId(req.body.createdById)
    if (req.body.branchId) condition.branchId = mongoose.Types.ObjectId(req.body.branchId)
    if (req.body.empId) condition.empId = req.body.empId

    const data = await User.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'employees',
                localField: '_id',
                foreignField: 'createdById',
                as: 'employeesData',
            },
        },
        { $unwind: { path: '$employeesData', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'shifts',
                let: { shift_id: '$employeesData.shift' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$shift_id'] } } }],
                as: 'shiftsData',
            },
        },
        { $unwind: { path: '$shiftsData', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                firstHalf: '$shiftsData.sessions.first',
                secondHalf: '$shiftsData.sessions.second',
                fullDay: '$shiftsData.sessions',
                ShiftId: '$shiftsData._id',
                empId: '$empId',
                createdById: '$createdById',
                companyId: '$companyId',
                branchId: '$branchId',
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await Shifts.countDocuments({
        ...condition,
        ...child_condition,
    })

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0], totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})
exports.delete = softDelete(Shifts)
exports.changeStatus = toggleStatus(Shifts)
