const Response = require('../../../../../lib/response'),
    catchAsync = require('./../../../../../lib/catchAsync'),
    toggleStatus = require('../../../../../api/v1/modules/factory/softDelete'),
    constants = require('./../../../../../lib/constants'),
    query = require('../../../../../lib/common_query'),
    softDelete = require('../../../../../api/v1/modules/factory/softDelete'),
    Shifts = require('../../../../v1/modules/shifts/models/shifts_model'),
    Branch = require('../../../../v1/modules/shifts/models/shifts_model'),
    User = require('../../../../v1/modules/user/models/user_model'),
    mongoose = require('mongoose')

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
    let condition = { isActive: true }
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
                employeesData: '$employeesData',
                timeZone: '$timeZone',
                calculateHours: '$calculateHours',
                sessions: '$sessions',
                inTime: '$sessions.first.inTime',
                outTime: '$sessions.second.outTime',
                fullDay: '$fullDay',
                halfDay: '$halfDay',
                days: '$days',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                createdById: '$createdById',
                companyId: '$companyId',
                branchName: '$branchData.branchName',
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

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
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

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})
exports.delete = softDelete(Shifts)
exports.changeStatus = toggleStatus(Shifts)
