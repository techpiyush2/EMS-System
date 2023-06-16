const Response = require('../../../../../lib/response'),
    catchAsync = require('./../../../../../lib/catchAsync'),
    toggleStatus = require('./../../factory/changeStatus'),
    constants = require('./../../../../../lib/constants'),
    query = require('./../../../../../lib/common_query'),
    softDelete = require('./../../factory/softDelete'),
    { holidayValidation, holidayUpdateValidation } = require('./../../../../../lib/joiValidation'),
    Holiday = require('../models/holiday_model'),
    mongoose = require('mongoose')
const Shift = require('../../shifts/models/shifts_model'),
    Branch = require('../../branch/models/branch_model')

exports.addHoliday = catchAsync(async (req, res) => {
    // Validating Req,body
    let validateObj = { name: req.body.name, from: new Date(req.body.from), to: new Date(req.body.to) }
    await holidayValidation.validateAsync(validateObj)

    // Check If Holiday Exist
    const isExist = await Holiday.findOne({ name: req.body.name, from: new Date(req.body.from), to: new Date(req.body.to), companyId: req.body.companyId, createdById: req.body.createdById })
    if (isExist) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))

    // Created Model Format
    var tempArray = []
    let locations = req.body.locations
    let commonObj = { name: req.body.name, from: req.body.from, to: req.body.to, description: req.body.description, companyId: req.body.companyId, createdById: req.body.createdById }
    locations.forEach((location) => {
        let tempShiftsValues = []
        location.shiftsArr.forEach((shift) => tempShiftsValues.push(shift))
        tempArray.push({ ...commonObj, locations: location.locationId, shifts: tempShiftsValues })
    })

    // Creating Entry
    const holidayInfo = await Holiday.create(tempArray)

    if (holidayInfo) return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
    else return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
})

exports.holidayDetails = catchAsync(async (req, res, next) => {
    // (req.body.locations) return res.json(Response(constants.statusCode.unauth, constants.branchMsg.branch))
    if (!req.body.companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    let condition = { companyId: mongoose.Types.ObjectId(req.body.companyId), _id: mongoose.Types.ObjectId(req.body._id) }

    const data = await Holiday.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'shifts',
                localField: 'locations',
                foreignField: 'branchId',
                pipeline: [{ $project: { _id: 1, name: 1 } }],
                as: 'shiftsInfo',
            },
        },
        {
            $lookup: {
                from: 'branches',
                localField: 'locations',
                foreignField: '_id',
                pipeline: [{ $project: { _id: 1, branchName: 1 } }],
                as: 'branchInfo',
            },
        },
        { $unwind: '$branchInfo' },
        {
            $project: {
                // shiftsInfo: '$shiftsInfo',
                shifts: '$shifts',
                // branchInfo: '$branchInfo',
                locationInfo: {
                    locationId: '$locations',
                    shiftsInfo: '$shiftsInfo',
                    branchName: '$branchInfo.branchName',
                },
                from: '$from',
                to: '$to',
                name: '$name',
                description: '$description',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                createdById: '$createdById',
                companyId: '$companyId',
            },
        },
    ])

    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})

exports.holidayUpdate = catchAsync(async (req, res) => {
    const { _id } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    // let validateObj = {
    //     name: req.body.name,
    //     shifts: req.body.locationInfo.shiftsInfo,
    //     locations: req.body.locationInfo.locationId,
    //     // locationInfo: { shiftsInfo: [{ shifts: mongoose.Types.ObjectId(req.body.locationInfo.shiftsInfo) }], locationId: mongoose.Types.ObjectId(req.body.locationInfo.locationId) },
    //     from: req.body.from,
    //     to: req.body.to,
    //     description: req.body.description,
    // }

    // await holidayUpdateValidation.validateAsync(validateObj)

    let updateObj = {
        name: req.body.name,
        shifts: req.body.locationInfo.shiftsInfo,
        locations: mongoose.Types.ObjectId(req.body.locationInfo.locationId),
        from: new Date(req.body.from),
        to: new Date(req.body.to),
        description: req.body.description,
    }

    await holidayUpdateValidation.validateAsync(updateObj)

    const Result = await Holiday.findByIdAndUpdate(_id, updateObj, {
        new: true,
    })
    console.log(Result, '===Result')

    if (Result) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
})

exports.holidayList = catchAsync(async (req, res) => {
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
    if (req.body.createdById) condition.createdById = mongoose.Types.ObjectId(req.body.createdById)
    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)

    if (req.body.shifts) condition.shifts = mongoose.Types.ObjectId(req.body.shifts)
    const data = await Holiday.aggregate([
        { $match: condition },

        {
            $lookup: {
                from: 'branches',
                let: { dep_id: '$locations' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$dep_id'] } } },
                    {
                        $project: {
                            address: 1,
                            branchCode: 1,
                            branchName: 1,
                        },
                    },
                ],
                as: 'locationsInfo',
            },
        },
        { $unwind: { path: '$locationsInfo', preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: 'shifts',
                localField: 'shifts',
                foreignField: '_id',
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                        },
                    },
                ],

                as: 'shiftData',
            },
        },

        {
            $project: {
                _id: 1,
                name: 1,
                isActive: 1,
                locationsInfo: 1,
                from: 1,
                to: 1,
                shifts: 1,
                shiftName: '$shiftData',
            },
        },

        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await Holiday.countDocuments({
        ...condition,
        ...child_condition,
    })

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

exports.delete = softDelete(Holiday)
exports.changeStatus = toggleStatus(Holiday)
