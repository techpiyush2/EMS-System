const { internalError } = require('../../../../../lib/response'),
    catchAsync = require('../../../../../lib/catchAsync'),
    Response = require('../../../../../lib/response'),
    constants = require('../../../../../lib/constants'),
    { attendanceRegularizedValidation } = require('../../../../../lib/joiValidation'),
    Attendance = require('./../../../../v1/modules/attendance/models/attendance_model'),
    User = require('./../../../../v1/modules/user/models/user_model'),
    AttendanceRegularized = require('./../../../../v1/modules/attendance/models/attendanceRegularized_model'),
    mailer = require('../../../../../lib/mailer'),
    config = require('../../../../../config/config').get(process.env.NODE_ENV)

const convertCsv = require('csvtojson')
const mongoose = require('mongoose')
const moment = require('moment')

exports.attendanceDetails = catchAsync(async (req, res, next) => {
    if (!req.body.empId) return res.json(Response(constants.statusCode.ok, constants.messages.idReq))
    if (!req.body.companyId) return res.json(Respnse(constants.statusCode.ok, constants.messages.companyId))
    if (!req.body.date) return res.json(Response(constants.statusCode.ok, constants.attendanceMsg.dateReq))

    let condition = {
        companyId: mongoose.Types.ObjectId(req.body.companyId),
        empId: req.body.empId,
        date: new Date(req.body.date),
    }
    const data = await Attendance.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'users',
                let: { empCode: '$empId' },
                pipeline: [{ $match: { $expr: { $eq: ['$empId', '$$empCode'] } } }],
                as: 'usersInfo',
            },
        },
        { $unwind: { path: '$usersInfo', preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: 'employees',
                let: { employeeId: '$usersInfo._id' },
                pipeline: [{ $match: { $expr: { $eq: ['$createdById', '$$employeeId'] } } }],
                as: 'employeeData',
            },
        },
        { $unwind: { path: '$employeeData', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'shifts',
                let: { employeeShift: '$employeeData.shift' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$employeeShift'] } } }],
                as: 'shiftData',
            },
        },
        { $unwind: { path: '$shiftData', preserveNullAndEmptyArrays: true } },

        {
            $project: {
                date: '$date',
                empId: '$empId',
                inTime: '$inTime',
                workHrs: '$workHrs',
                outTime: '$outTime',
                shiftHrs: '$shiftHrs',
                companyId: '$companyId',
                workStatus: '$workStatus',
                createdById: '$createdById',
                calculatedWorkHours: { $round: ['$calculatedWorkHours', 2] }, //"$calculatedWorkHours",
                firstSessionTime: '$shiftData.sessions.first.outTime',
                secondSessionTime: '$shiftData.sessions.second.inTime',
            },
        },
    ])

    if (data.length) {
        // calculate break hours
        const secondSessionTime = data[0].secondSessionTime
        const firstSessionTime = data[0].firstSessionTime
        const breakHours = moment.utc(moment(secondSessionTime, 'HH:mm').diff(moment(firstSessionTime, 'HH:mm'))).format('HH:mm')

        // calculate actualHours
        const workHours = data[0].workHrs

        let defaultHours = '00:00'

        const actualHours = moment.utc(moment(workHours, 'HH:mm').diff(moment(breakHours, 'HH:mm'))).format('HH:mm')

        const datadata = { ...data[0], breakHours: workHours != '00:00' ? breakHours : defaultHours, actualHours: workHours != '00:00' ? actualHours : defaultHours }

        return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, datadata))
    } else return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
})
exports.attendanceMonthlyDetails = catchAsync(async (req, res, next) => {
    console.log(req.body)

    if (!req.body.empId) {
        return res.json(Response(constants.statusCode.ok, constants.messages.idReq))
    }
    if (!req.body.companyId) {
        return res.json(Response(constants.statusCode.ok, constants.messages.companyId))
    }
    let condition = {
        companyId: mongoose.Types.ObjectId(req.body.companyId),
        empId: req.body.empId,
    }
    let currentYear = new Date().getFullYear()
    let { monthNumber } = req.body
    let newDate = currentYear + '-' + monthNumber + '-01'
    let startDate = moment(new Date(newDate)).startOf('month').format('YYYY-MM-DD')
    let endDate = moment(new Date(newDate)).endOf('month').format('YYYY-MM-DD')
    condition.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
    }

    const data = await Attendance.aggregate([
        { $match: condition },
        {
            $project: {
                date: '$date',
                otHrs: '$otHrs',
                empId: '$empId',
                inTime: '$inTime',
                outTime: '$outTime',
                workHrs: '$workHrs',
                isActive: '$isActive',
                shiftHrs: '$shiftHrs',
                workStatus: '$workStatus',
                shortfallHours: '$shortfallHours',
                calculatedWorkHours: '$calculatedWorkHours',
            },
        },
    ])
    if (data.length) {
        return res.json(Response(constants.statusCode.ok, constants.attendanceMsg.dataFetch, data))
    } else {
        return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
    }
})
exports.attendanceRegularized = catchAsync(async (req, res) => {
    let validateObj = {
        regularizedReason: req.body.regularizedReason,
        regularizedNote: req.body.regularizedNote,
    }

    await attendanceRegularizedValidation.validateAsync(validateObj)
    const { companyId, attendanceId, regularizedIn, regularizedOut, empId } = req.body
    if (!companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))
    if (!attendanceId) return res.json(Response(constants.statusCode.unauth, constants.attendanceMsg.attendanceId))
    if (!regularizedIn) return res.json(Response(constants.statusCode.unauth, constants.regularizedMsg.regularizedIn))
    if (!regularizedOut) return res.json(Response(constants.statusCode.unauth, constants.regularizedMsg.regularizedOut))
    validateObj.regularizedIn = regularizedIn
    validateObj.regularizedOut = regularizedOut
    validateObj.companyId = companyId
    validateObj.attendanceId = attendanceId
    validateObj.empId = empId

    const attendanceInfo = await AttendanceRegularized.create(validateObj)

    const condition = {
        companyId: mongoose.Types.ObjectId(req.body.companyId),
    }
    const userData = await User.aggregate([
        {
            $match: condition,
        },

        {
            $lookup: {
                from: 'roles',
                let: { id: '$roleId', name: '$roleTitle' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [{ $eq: ['$_id', '$$id'] }, { $eq: ['$roleTitle', 'HR'] }],
                            },
                        },
                    },

                    { $project: { roleTitle: 1, _id: 1 } },
                ],
                as: 'roleData',
            },
        },
        { $unwind: { path: '$roleData' } },
        {
            $project: {
                email: 1,
                firstName: 1,
                lastName: 1,
                roleData: 1,
            },
        },
    ])

    const empObj = await Attendance.findOne({ _id: attendanceInfo.attendanceId }, { _id: 1, empId: 1, date: 1, inTime: 1, outTime: 1 })

    const nameObj = await User.findOne({ empId: empObj.empId }, {})

    //used to send mail in bulk
    userData.forEach((el) => {
        const printContents = {
            toFirstName: el.firstName,
            toLastName: el.lastName,
            Name: nameObj.firstName,
            lastName: nameObj.lastName,
            Employee_id: empObj.empId,

            Date: moment(empObj.date).format('ll'),
            CurrentInTime: empObj.inTime,
            CurrentOutTime: empObj.outTime,
            RegularizedInTime: attendanceInfo.regularizedIn,
            RegularizedOutTime: attendanceInfo.regularizedOut,
            regularizedReason: attendanceInfo.regularizedReason,
            viewRequest: req.body.isActive == true ? config.frontEndURL + 'EmpDashboard' : config.frontEndURL + 'Login',
        }
        const options = {
            to: el.email,
            subject: constants.email.regularizedReq,
        }
        const abc = mailer.applyRegularizedLeave(options, printContents)
    })
    if (attendanceInfo || userData) {
        return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
    } else {
        return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
    }
})
exports.attendanceRegularizedList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 10
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)

    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { name: 1 }
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

    if (req.body.status) {
        condition.status = req.body.status
    }

    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)

    if (req.body.attendanceId) condition.attendanceId = mongoose.Types.ObjectId(req.body.attendanceId)
    const data = await AttendanceRegularized.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'attendances',
                localField: 'attendanceId',
                foreignField: '_id',
                as: 'attendanceData',
            },
        },
        { $unwind: { path: '$attendanceData', preserveNullAndEmptyArrays: true } },

        {
            $project: {
                date: '$attendanceData.date',
                inTime: '$attendanceData.inTime',
                outTime: '$attendanceData.outTime',
                endDate: '$endDate',
                regularizedIn: '$regularizedIn',
                regularizedOut: '$regularizedOut',
                regularizedReason: '$regularizedReason',
                status: '$status',
                companyId: '$companyId',
                attendanceId: '$attendanceId',
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])

    const totalCount = await AttendanceRegularized.countDocuments({
        ...condition,
        ...child_condition,
    })

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})
exports.attendanceStatus = catchAsync(async (req, res) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    if (!req.body.attendanceId) return res.json(Response(constants.statusCode.unauth, constants.messages.attendanceId))
    if (!req.body.companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))
    if (!req.body.status) return res.json(Response(constants.statusCode.unauth, constants.empMsg.status))

    const { _id, companyId, attendanceId, status } = req.body
    const attendance_condition = { _id: _id, companyId: companyId, attendanceId: attendanceId }
    const AttendanceObj = await AttendanceRegularized.findOne(attendance_condition, {})

    if (!AttendanceObj) return res.json(Response(constants.statusCode.unauth, constants.messages.noRecordFound))
    updateObj = { status: status }

    const updatedObj = await AttendanceRegularized.findOneAndUpdate(attendance_condition, updateObj)
    if (updateObj.status === 'ACCEPT') {
        const finalResult = await Attendance.findOneAndUpdate({ _id: updatedObj.attendanceId }, { inTime: updatedObj.regularizedIn, outTime: updatedObj.regularizedOut, date: updatedObj.date })
        return res.json(Response(constants.statusCode.ok, constants.messages.alreadyApproveAttendance(status)))
    } else {
        return res.json(Response(constants.statusCode.ok, constants.messages.alreadyApproveAttendance(status)))
    }
})
exports.attendanceRegularizedDetails = catchAsync(async (req, res, next) => {
    if (!req.body.attendanceId) return res.json(Response(constants.statusCode.ok, constants.messages.attendanceId))

    let condition = {
        attendanceId: mongoose.Types.ObjectId(req.body.attendanceId),
    }

    const data = await AttendanceRegularized.aggregate([
        { $match: condition },

        {
            $lookup: {
                from: 'attendances',
                localField: 'attendanceId',
                foreignField: '_id',
                as: 'attendanceInfo',
            },
        },
        { $unwind: { path: '$attendanceInfo', preserveNullAndEmptyArrays: true } },

        {
            $project: {
                inTime: '$attendanceInfo.inTime',
                outTime: '$attendanceInfo.outTime',
                date: '$attendanceInfo.date',
                workHrs: '$attendanceInfo.workHrs',
                regularizedReason: '$regularizedReason',
                regularizedIn: '$regularizedIn',
                status: '$status',
                regularizedOut: '$regularizedOut',
            },
        },
    ])
    const totalCount = await AttendanceRegularized.countDocuments({
        ...condition,
        ...child_condition,
    })
    if (data.length) {
        return res.json(Response(constants.statusCode.ok, constants.attendanceMsg.dataFetch, data))
    } else {
        return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound, [], totalCount))
    }
})
