'use strict'

const catchAsync = require('../../../../../lib/catchAsync'),
    Response = require('../../../../../../app/lib/response'),
    constants = require('../../../../../../app/lib/constants'),
    query = require('../../../../../../app/lib/common_query'),
    toggleStatus = require('./../../../../v1/modules/factory/changeStatus'),
    { timeLogValidation } = require('./../../../../../lib/joiValidation'),
    softDelete = require('./../../../../v1/modules/factory/softDelete'),
    utility = require('./../../../../../lib/utility'),
    mailer = require('./../../../../../lib/mailer'),
    update = require('./../../../../v1/modules/factory/update'),
    mongoose = require('mongoose'),
    Timelog = require('../models/timelog_model'),
    Attendance = require('../../attendance/models/attendance_model'),
    User = require('../../user/models/user_model'),
    uuid = require('uuid'),
    fs = require('fs'),
    jwt = require('jsonwebtoken'),
    config = require('../../../../../config/config').get(process.env.NODE_ENV)
const { date } = require('joi')
const bcrypt = require('bcrypt')
const { timeLog } = require('console')
const moment = require('moment')
const { chdir } = require('process')
const Employee = require('../../employee/models/empPersonalDetail_model')
const NotFillModel = require('../models/not_fill_model')

exports.addTimeLog = catchAsync(async (req, res, next) => {
    let validateObj = {
        reportedDate: req.body.reportedDate,
        totalHours: req.body.totalHours,
        employeeId: req.body.employeeId,
        companyId: req.body.companyId,
    }
    await timeLogValidation.validateAsync(validateObj)

    validateObj.reportedDate = new Date(moment.utc(req.body.reportedDate).format('YYYY-MM-DD'))
    // if (!req.body.taskDetail.typeOfWork) return res.json(Response(constants.statusCode.unauth, constants.timeLogMsg.taskReq))
    // if (!req.body.taskDetail.duration) return res.json(Response(constants.statusCode.unauth, constants.timeLogMsg.taskReq))
    // if (!req.body.taskDetail.taskDetails) return res.json(Response(constants.statusCode.unauth, constants.timeLogMsg.taskReq))

    // if (!req.body.taskDetail.moduleName) return res.json(Response(constants.statusCode.unauth, constants.timeLogMsg.taskReq))

    if (!req.body.taskDetail.length) return res.json(Response(constants.statusCode.unauth, constants.timeLogMsg.taskReq))
    validateObj['taskDetail'] = req.body.taskDetail

    console.log('validateObj', validateObj)
    let timeLogInfo = await Timelog.create(validateObj)

    if (!timeLogInfo) {
        return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
    } else {
        return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
    }
})
exports.timeLogList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 10
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)

    let sortObject = {}

    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { _id: -1 }
    }
    let sortOrder = { _id: -1 }

    let condition = {}
    let child_condition = {}

    if (req.body.employeeId) {
        condition.employeeId = mongoose.Types.ObjectId(req.body.userId)
    }

    if (req.body.projectId) {
        condition.projectId = mongoose.Types.ObjectId(req.body.projectId)
    }

    if (req.body.companyId) {
        condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
    }

    if (req.body.reportedDate) {
        let tempDate = moment.utc(req.body.reportedDate).add(1, 'days').format('YYYY-MM-DD')
        const newDate1 = new Date(tempDate)
        let newDate = new Date(moment.utc(req.body.reportedDate).format('YYYY-MM-DD'))
        condition.reportedDate = {
            $lt: newDate1,
            $gte: newDate,
        }
    }

    if (req.body.searchText) {
        const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')
        child_condition.$or = [{ 'empData.firstName': new RegExp(searchText, 'gi') }, { 'empData.lastName': new RegExp(searchText, 'gi') }]
    }
    console.log(condition, '===========')
    let data = await Timelog.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'users',
                let: { empId: '$employeeId' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$empId'] } } }],
                as: 'empData',
            },
        },
        { $unwind: { path: '$empData', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$taskDetail' } },
        {
            $lookup: {
                from: 'projects',
                let: { projectId: '$taskDetail.projectId' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$projectId'] } } },
                    {
                        $project: {
                            _id: '$_id',
                            name: '$name',
                            code: '$code',
                        },
                    },
                ],
                as: 'projectData',
            },
        },
        { $unwind: { path: '$projectData', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: '$_id',
                totalHours: { $first: '$totalHours' },
                reportedDate: { $first: '$reportedDate' },
                empData: { $first: '$empData' },
                taskDetail: {
                    $push: {
                        projectData: '$projectData',
                        billable: '$taskDetail.billable',
                        typeOfWork: '$taskDetail.typeOfWork',
                        duration: '$taskDetail.duration',
                        moduleName: '$taskDetail.moduleName',
                        taskDetail: '$taskDetail.taskDetail',
                        status: '$taskDetail.status',
                        _id: '$taskDetail._id',
                    },
                },
            },
        },
        {
            $project: {
                _id: 1,
                reportedDate: 1,
                totalHours: 1,
                taskDetail: 1,
                empData: {
                    firstName: '$empData.firstName',
                    lastName: '$empData.lastName',
                    email: '$empData.email',
                    image: '$empData.image',
                    empId: '$empData.empId',
                },
            },
        },
        { $match: child_condition },
        { $sort: sortOrder },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])

    let totalCount = await Timelog.aggregate([
        { $match: condition },

        {
            $lookup: {
                from: 'users',
                let: { empId: '$employeeId' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$empId'] } } }],
                as: 'empData',
            },
        },
        { $unwind: { path: '$empData', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$taskDetail' } },
        {
            $lookup: {
                from: 'projects',
                let: { projectId: '$taskDetail.projectId' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$projectId'] } } },
                    {
                        $project: {
                            _id: '$_id',
                            name: '$name',
                            code: '$code',
                        },
                    },
                ],
                as: 'projectData',
            },
        },
        { $unwind: { path: '$projectData', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: '$_id',
                totalHours: { $first: '$totalHours' },
                reportedDate: { $first: '$reportedDate' },
                empData: { $first: '$empData' },
                taskDetail: {
                    $push: {
                        projectData: '$projectData',
                        billable: '$taskDetail.billable',
                        typeOfWork: '$taskDetail.typeOfWork',
                        duration: '$taskDetail.duration',
                        moduleName: '$taskDetail.moduleName',
                        taskDetail: '$taskDetail.taskDetail',
                        status: '$taskDetail.status',
                        _id: '$taskDetail._id',
                    },
                },
            },
        },
        {
            $project: {
                _id: 1,
                reportedDate: 1,
                totalHours: 1,
                taskDetail: 1,
                empData: {
                    firstName: '$empData.firstName',
                    lastName: '$empData.lastName',
                    email: '$empData.email',
                    image: '$empData.image',
                    empId: '$empData.empId',
                },
            },
        },
        { $match: child_condition },
    ])
    if (data.length) {
        return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount.length))
    } else {
        return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount.length))
    }
})
exports.deleteTask = catchAsync(async (req, res) => {
    if (!req.body.taskId) {
        return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    }
    if (!req.body.userId) {
        return res.json(Response(constants.statusCode.unauth, constants.messages.empId))
    }

    let isDeleted = await Timelog.findOneAndDelete({ _id: req.body.taskId, employeeId: req.body.userId })

    if (isDeleted) {
        return res.json(Response(constants.statusCode.ok, constants.messages.delSuccess))
    } else {
        return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
    }
})
exports.pendingStatusList = catchAsync(async (req, res) => {
    const count = req.body.count ? req.body.count : constants.settings.count
    req.body.page = req.body.page ? req.body.page : constants.settings.defaultPageNo
    const skip = count * (req.body.page - 1)
    let condition = {}
    let child_condition = {}

    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { date: -1 }
    }
    if (req.body.searchText) {
        const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')

        condition.$or = [{ date: new RegExp(searchText, 'gi') }]
    }

    if (req.body.date) condition.date = new Date(moment(req.body.date).startOf('day').utc())
    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
    if (req.body.workStatus) condition.workStatus = req.body.workStatus
    const data = await Attendance.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'users',
                let: { empCode: '$empId' },
                pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$empId', '$$empCode'] }] } } }],
                as: 'userInfo',
            },
        },
        { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'timelogs',
                let: { userCode: '$userInfo._id', userDate: '$date' },
                pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$employeeId', '$$userCode'] }, { $eq: ['$reportedDate', '$$userDate'] }] } } }],
                as: 'timelogsInfo',
            },
        },
        { $match: { $expr: { $eq: [{ $size: '$timelogsInfo' }, 0] } } },

        {
            $project: {
                firstName: '$userInfo.firstName',
                empId: '$userInfo.empId',
                workStatus: '$workStatus',
                timelogsInfo: '$timelogsInfo',
            },
        },
    ])
    const totalCount = await Attendance.countDocuments({
        ...condition,
    })
    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})
exports.notFilledEmp = catchAsync(async (req, res) => {
    let condition = {}
    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
    condition.workStatus = 'P'
    condition.date = new Date(moment(req.body.date).startOf('day'))

    const data = await Attendance.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'users',
                let: { empCode: '$empId' },
                pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$empId', '$$empCode'] }] } } }],
                as: 'userInfo',
            },
        },
        { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'timelogs',
                let: { userCode: '$userInfo._id', userDate: '$date' },
                pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$employeeId', '$$userCode'] }, { $eq: ['$reportedDate', '$$userDate'] }] } } }],
                as: 'timelogsInfo',
            },
        },
        { $match: { $expr: { $eq: [{ $size: '$timelogsInfo' }, 0] } } },

        {
            $project: {
                firstName: '$userInfo.firstName',
                companyId: '$userInfo.companyId',
                userId: '$userInfo._id',
                workStatus: '$workStatus',
                timeLog: '$timelogsInfo',
                date: '$date',
            },
        },
    ])

    if (!data.length) return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))

    let insert
    if (data.length) {
        let insertData = []

        data.map((res) => {
            insertData.push({
                date: res['date'],
                employeeId: mongoose.Types.ObjectId(res.userId),
                companyId: mongoose.Types.ObjectId(res.companyId),
            })
        })

        insert = await NotFillModel.insertMany(insertData)
    }

    if (insert.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, insert, insert.length))
})
exports.isBlocked = catchAsync(async (req, res) => {
    let condition = {}

    if (req.body.companyId && req.body.employeeId) {
        condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
        condition.employeeId = mongoose.Types.ObjectId(req.body.employeeId)
        condition.isActive = true
        condition.isDelete = false
    }

    let response = {}

    response['canFillTimeLog'] = true

    return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, response))
})
