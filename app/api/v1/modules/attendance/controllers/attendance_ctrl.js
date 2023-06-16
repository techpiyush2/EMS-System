'use strict'

const { internalError } = require('../../../../../lib/response'),
    catchAsync = require('../../../../../lib/catchAsync'),
    Response = require('../../../../../lib/response'),
    constants = require('../../../../../lib/constants'),
    Attendance = require('../models/attendance_model'),
    { attendanceRegularizedValidation } = require('../../../../../lib/joiValidation'),
    User = require('../../user/models/user_model'),
    Shift = require('../../shifts/models/shifts_model'),
    mailer = require('../../../../../lib/mailer'),
    AttendanceRegularized = require('../models/attendanceRegularized_model'),
    uuid = require('uuid'),
    config = require('../../../../../config/config').get(process.env.NODE_ENV)
const convertCsv = require('csvtojson')
const mongoose = require('mongoose')
const moment = require('moment')
const Holiday = require('../../holiday/models/holiday_model')
const Employee = require('../../employee/models/empPersonalDetail_model')
const LeaveApply = require('../../leaveApply/models/leaveApply_model')
const sgMail = require('@sendgrid/mail')
const mailCongig = require('../../../../../config/mailConfig')
sgMail.setApiKey(mailCongig.SENDGRID_API_KEY)

exports.addAttendance = catchAsync(async (req, res) => {
    if (!req.body.file) {
        return res.json(Response(constants.statusCode.unauth, constants.attendanceMsg.file))
    }
    if (!req.body.createdById) {
        return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))
    }
    if (!req.body.companyId) {
        return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))
    }
    if (!req.body.date) {
        return res.json(Response(constants.statusCode.unauth, constants.attendanceMsg.dateReq))
    }
    if (!req.body.branchId) {
        return res.json(Response(constants.statusCode.unauth, constants.messages.branchId))
    }
    const shiftObj = await Shift.findOne(
        {
            branchId: mongoose.Types.ObjectId(req.body.branchId),
            companyId: mongoose.Types.ObjectId(req.body.companyId),
        },
        {
            graceIn: '$sessions.first.graceIn',
            graceOut: '$sessions.second.graceOut',
            inMargin: '$sessions.first.inMargin',
            outMargin: '$sessions.second.outMargin',
            inTime: '$sessions.first.inTime',
            outTime: '$sessions.second.outTime',
            fullDay: '$fullDay',
        }
    ).lean()

    convertCsv()
        .fromFile(`uploads/attendance/${req.body.file}`)
        .then(async (csvData) => {
            csvData.forEach((attendance) => {
                attendance['createdById'] = mongoose.Types.ObjectId(req.body.createdById)

                attendance['branchId'] = mongoose.Types.ObjectId(req.body.branchId)
                attendance['companyId'] = mongoose.Types.ObjectId(req.body.companyId)
                attendance['shiftId'] = mongoose.Types.ObjectId(shiftObj._id.toString())
                attendance['date'] = moment(new Date(req.body.date)).utc().startOf('day')
                attendance['inTime'] = attendance.inTime ? moment(moment(new Date(req.body.date)).format('YYYY-MM-DD') + ' ' + attendance.inTime).format() : ''
                attendance['outTime'] = attendance.outTime ? moment(moment(new Date(req.body.date)).format('YYYY-MM-DD') + ' ' + attendance.outTime).format() : ''
                attendance['workHrs'] = attendance.inTime && attendance.outTime ? moment(attendance.outTime).diff(moment(attendance.inTime), 'minutes') : 0
                attendance['otHrs'] = attendance.workHrs > shiftObj.fullDay ? attendance.workHrs - shiftObj.fullDay : 0
                attendance['shortfallHours'] = attendance.workHrs < shiftObj.fullDay ? shiftObj.fullDay - attendance.workHrs : 0
                attendance['diff'] = attendance.otHrs > 0 ? 'excess' : 'shortFall'
                attendance['calculatedShiftHrs'] = moment(shiftObj.outTime).diff(moment(shiftObj.inTime), 'minutes')
            })

            // return false
            let finalData = await Attendance.insertMany(csvData)
            if (finalData.length) {
                return res.json(Response(constants.statusCode.ok, constants.attendanceMsg.attendanceSuccess))
            } else {
                return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
            }
        })
})

exports.attendanceList = catchAsync(async (req, res) => {
    const count = req.body.count ? req.body.count : constants.settings.count
    req.body.page = req.body.page ? req.body.page : constants.settings.defaultPageNo
    const skip = count * (req.body.page - 1)
    let condition = {}

    if (req.body.searchText) {
        const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')
        condition.$or = [{ firstName: new RegExp(searchText, 'gi') }, { lastName: new RegExp(searchText, 'gi') }]
    }
    // condition.$and = [{ inTime: { $ne: null } }, {empId : {$ne : NaN}}]

    if (req.body.date) condition.date = new Date(moment.utc(req.body.date).startOf('day'))

    if (!req.body.date) {
        return res.json(Response(constants.statusCode.unauth, constants.attendanceMsg.dateReq))
    }
    if (req.body.createdById) condition.createdById = mongoose.Types.ObjectId(req.body.createdById)

    if (req.body.branchId) condition.branchId = mongoose.Types.ObjectId(req.body.branchId)

    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
    if (!req.body.companyId) {
        return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))
    }

    //  { department : { $ne: null }
    if (req.body.empId) condition.empId = req.body.empId
    const newData = await Attendance.aggregate([
        { $match: condition },

        {
            $lookup: {
                from: 'users',
                let: {
                    empCode: '$empId',
                    companyId: '$companyId',
                    branchId: '$branchId',
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [{ $eq: ['$empId', '$$empCode'] }, { $eq: ['$branchId', '$$branchId'] }, { $eq: ['$companyId', '$$companyId'] }],
                            },
                        },
                    },
                ],
                as: 'usersInfo',
            },
        },
        { $unwind: { path: '$usersInfo', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'employees',
                let: { userCode: '$usersInfo._id' },
                pipeline: [{ $match: { $expr: { $eq: ['$createdById', '$$userCode'] } } }],
                as: 'employeesData',
            },
        },
        { $unwind: { path: '$employeesData', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'shifts',
                let: { shiftId: '$shiftId' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$shiftId'] } } }],
                as: 'shiftsData',
            },
        },
        { $unwind: { path: '$shiftsData', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                firstName: '$usersInfo.firstName',
                lastName: '$usersInfo.lastName',
                date: '$date',
                empId: '$empId',
                inTime: '$inTime',
                outTime: '$outTime',
                shiftHrs: '$shiftsData.fullDay',
                shiftStartTime: '$shiftsData.sessions.first.inTime',
                shiftEndTime: '$shiftsData.sessions.second.outTime',
                shiftHalfHours: '$shiftsData.halfDay',
                workHrs: '$workHrs',
                otHrs: '$otHrs',
                workStatus: '$workStatus',
                createdById: '$createdById',
                companyId: '$companyId',
                branchId: '$branchId',
            },
        },
    ])

    const totalCount = await Attendance.countDocuments({
        ...condition,
    })

    let data = []

    newData.forEach((e) => {
        if (e !== null) {
            data.push(e)
        }
    })

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

exports.attendanceGraphList = catchAsync(async (req, res) => {
    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { _id: -1 }
    }

    let condition = {}

    let currentYear = new Date().getFullYear()
    let { monthNumber } = req.body

    let newDate = currentYear + '-' + monthNumber + '-01'
    let startDate = moment(new Date(newDate)).startOf('month').format('YYYY-MM-DD')
    let endDate = moment(new Date(newDate)).endOf('month').format('YYYY-MM-DD')
    let divideValue = req.body.monthNumber == '02' ? 20 : 22
    // let divideValue = 22;

    condition.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
    }

    if (req.body.createdById) condition.createdById = mongoose.Types.ObjectId(req.body.createdById)
    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
    const data = await Attendance.aggregate([
        {
            $match: condition,
        },

        {
            $group: {
                _id: '$workStatus',
                count: {
                    $sum: 1,
                },
            },
        },
        {
            $project: {
                workStatus: '$_id',
                total: { $round: { $divide: ['$count', divideValue] } },
            },
        },
        { $sort: sortObject },
    ])

    if (data.length) {
        return res.json(Response(constants.statusCode.ok, constants.attendanceMsg.dataFetch, data))
    } else {
        return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, []))
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
            firstName: nameObj.firstName,
            lastName: nameObj.lastName,
            Employee_id: empObj.empId,

            Date: moment(empObj.date).format('ll'),
            CurrentInTime: moment(empObj.inTime).format(),
            CurrentOutTime: moment(empObj.outTime).format(),
            RegularizedInTime: moment(attendanceInfo.regularizedIn).format('LT'),
            RegularizedOutTime: moment(attendanceInfo.regularizedOut).format('LT'),
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
    const { empId } = req.body
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
    if (empId) {
        condition.$and = [{ empId: { $ne: empId } }]
    } else return res.json(Response(constants.statusCode.ok, constants.messages.empId))

    const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')
    if (req.body.searchText) {
        child_condition.$or = [{ userName: new RegExp(searchText, 'gi') }, { userlastName: new RegExp(searchText, 'gi') }, { status: new RegExp(searchText, 'gi') }, { userEmpId: new RegExp(searchText, 'gi') }]
    }

    if (req.body.status) {
        condition.status = req.body.status
    }

    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
    if (req.body.attendanceId) condition.attendanceId = mongoose.Types.ObjectId(req.body.attendanceId)

    if (req.body.startDate)
        child_condition.date = {
            $gte: new Date(req.body.startDate),
            $lte: new Date(req.body.endDate),
        }

    const data = await AttendanceRegularized.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'attendances',
                let: { attendanceId: '$attendanceId', companyId: '$companyId' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [{ $eq: ['$_id', '$$attendanceId'] }, { $eq: ['$companyId', '$$companyId'] }],
                            },
                        },
                    },
                ],

                as: 'attendanceData',
            },
        },
        { $unwind: { path: '$attendanceData', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'users',
                let: { empId: '$attendanceData.empId', companyId: '$companyId' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [{ $eq: ['$empId', '$$empId'] }, { $eq: ['$companyId', '$$companyId'] }],
                            },
                        },
                    },
                ],

                as: 'userData',
            },
        },
        { $unwind: { path: '$userData', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                userEmpId: '$userData.empId',
                userName: '$userData.firstName',
                userLastName: '$userData.lastName',
                date: '$attendanceData.date',
                inTime: '$attendanceData.inTime',
                outTime: '$attendanceData.outTime',
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
    // console.log('data====', data)
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
    const attendance_condition = {
        _id: _id,
        companyId: companyId,
        attendanceId: attendanceId,
    }
    const AttendanceObj = await AttendanceRegularized.findOne(attendance_condition)
    if (!AttendanceObj) return res.json(Response(constants.statusCode.unauth, constants.messages.noRecordFound))

    const updateObj = { status: status }

    const updatedObj = await AttendanceRegularized.findOneAndUpdate(attendance_condition, updateObj)

    if (updateObj.status === 'ACCEPT') {
        const finalResult = await Attendance.findOneAndUpdate(
            { _id: updatedObj.attendanceId },
            {
                inTime: new Date(updatedObj.regularizedIn),
                outTime: new Date(updatedObj.regularizedOut),
                status: updatedObj.status,
                workStatus: 'P',
            }
        )
        return res.json(Response(constants.statusCode.ok, constants.messages.acceptedAttendance))
    } else if (updateObj.status === 'DECLINED') {
        const finalResult = await Attendance.findOneAndUpdate(
            { _id: updatedObj.attendanceId },
            {
                workStatus: 'A',
            }
        )
        console.log(finalResult)
        return res.json(Response(constants.statusCode.ok, constants.messages.declinedAttendance, finalResult))
    } else {
        return res.json(Response(constants.statusCode.ok, constants.messages.alreadyApproved))
    }
})

exports.attendanceDetails = catchAsync(async (req, res, next) => {
    if (!req.body.empId) {
        return res.json(Response(constants.statusCode.ok, constants.messages.empId))
    }
    if (!req.body.companyId) {
        return res.json(Response(constants.statusCode.ok, constants.messages.companyId))
    }

    if (!req.body._id) {
        return res.json(Response(constants.statusCode.ok, constants.messages.idReq))
    }

    let condition = {
        companyId: mongoose.Types.ObjectId(req.body.companyId),
        empId: req.body.empId,
        _id: mongoose.Types.ObjectId(req.body._id),
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
                let: { empCode: '$usersInfo._id' },
                pipeline: [{ $match: { $expr: { $eq: ['$createdById', '$$empCode'] } } }],
                as: 'employeeData',
            },
        },
        { $unwind: { path: '$employeeData', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'shifts',
                let: { empCode: '$employeeData.shift' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$empCode'] } } }],
                as: 'shiftData',
            },
        },
        { $unwind: { path: '$shiftData', preserveNullAndEmptyArrays: true } },

        {
            $project: {
                inTime: '$inTime',
                outTime: '$outTime',
                date: '$date',
                shiftHrs: '$shiftHrs',
                empId: '$empId',
                companyId: '$companyId',
                createdById: '$createdById',
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
        const workHours = moment.utc(moment(data[0].outTime, 'HH:mm').diff(moment(data[0].inTime, 'HH:mm'))).format('HH:mm')
        const actualHours = moment.utc(moment(workHours, 'HH:mm').diff(moment(breakHours, 'HH:mm'))).format('HH:mm')

        const datadata = {
            ...data[0],
            workHours: workHours,
            breakHours: breakHours,
            actualHours: actualHours,
        }
        return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, datadata))
    } else return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
})
exports.attendanceMonthlyDetails = catchAsync(async (req, res, next) => {
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
        { $unwind: { path: '$holidayData', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'shifts',
                let: { shift: '$shiftId' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$shift'] } } }],
                as: 'shiftData',
            },
        },
        { $unwind: { path: '$shiftData', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                date: 1,
                empId: 1,
                inTime: 1,
                outTime: 1,
                workStatus: 1,
                createdById: 1,
                companyId: 1,
                shiftId: 1,
                branchId: 1,
                workHrs: 1,
                otHrs: 1,
                calculatedShiftHrs: 1,
                shortfallHours: 1,
                diff: 1,
                shiftHrs: '$shiftData.fullDay',
                calculatedWorkHours: '$workHrs',
                companyId: '$companyId',
            },
        },
    ])

    let totalWorkHrs = 0
    let shiftWorkingHrs = 0
    data.length &&
        data.forEach((attendance) => {
            totalWorkHrs = attendance.workHrs + totalWorkHrs
            shiftWorkingHrs = attendance.shiftHrs + shiftWorkingHrs
        })

    let holidayData
    if (req.body.companyId) {
        let companyId = req.body.companyId
        holidayData = await Holiday.find({ companyId })
    }

    let shiftCondition = {}

    if (req.body.empId) {
        shiftCondition.empId = req.body.empId
    }

    const shiftData = await User.aggregate([
        { $match: shiftCondition },
        {
            $lookup: {
                from: 'employees',
                localField: '_id',
                foreignField: 'createdById',
                as: 'empData',
            },
        },

        { $unwind: { path: '$empData', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'shifts',
                localField: 'empData.shift',
                foreignField: '_id',
                as: 'shiftData',
            },
        },

        { $unwind: { path: '$shiftData', preserveNullAndEmptyArrays: true } },

        {
            $project: {
                days: '$shiftData.days',
            },
        },
    ])

    let leaveData
    if (req.body.empId) {
        let empId = req.body.empId
        const createdById = await User.findOne({ empId })
        leaveData = await LeaveApply.find({ createdById: createdById._id })
    }

    let approvedData = []

    if (leaveData.length) {
        for (let i = 0; i < leaveData.length; i++) {
            if (leaveData[i].isApproved === 'APPROVED') {
                approvedData.push(leaveData[i])
            }
        }
    }

    let finalDataToSend = {
        reportData: {
            totalWorkHrs: shiftWorkingHrs,
            shiftWorkingHrs: totalWorkHrs,
            actualWorkedHrs: totalWorkHrs,
            shortFall: totalWorkHrs - shiftWorkingHrs,
        },

        attendanceData: data,
        holidayData,
        shiftData,
        leaveData: approvedData,
    }
    if (data.length) {
        return res.json(Response(constants.statusCode.ok, constants.attendanceMsg.dataFetch, finalDataToSend))
    } else {
        return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
    }
})

exports.empRegularizedList = catchAsync(async (req, res) => {
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
        child_condition.$or = [{ status: new RegExp(searchText, 'gi') }]
    }
    if (req.body.empId) condition.empId = req.body.empId
    if (req.body.status) condition.status = req.body.status

    const data = await AttendanceRegularized.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'attendances',
                let: { attendanceId: '$attendanceId' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$attendanceId'] } } }],
                as: 'attendanceInfo',
            },
        },
        { $unwind: { path: '$attendanceInfo', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                regularizedIn: '$regularizedIn',
                regularizedOut: '$regularizedOut',
                regularizedReason: '$regularizedReason',
                regularizedNote: '$regularizedNote',
                status: '$status',
                empId: '$empId',
                InTime: '$attendanceInfo.inTime',
                outTime: '$attendanceInfo.outTime',
                date: '$attendanceInfo.date',
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

exports.attendanceCron = catchAsync(async (req, res) => {
    const condition = { date: new Date(moment().format('YYYY-MM-DD')) }

    console.log('condition', condition)
    const data = await Attendance.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'users',
                // localField: 'companyId',
                // foreignField: 'companyId',
                let: { empId: '$empId', companyId: '$companyId' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [{ $eq: ['$empId', '$$empId'] }, { $eq: ['$companyId', '$$companyId'] }],
                            },
                        },
                    },
                ],
                as: 'usersInfo',
            },
        },
        { $unwind: { path: '$usersInfo', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'shifts',
                let: {
                    empShiftId: '$shiftId',
                    companyId: '$companyId',
                    branchId: '$branchId',
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [{ $eq: ['$_id', '$$empShiftId'] }, { $eq: ['$companyId', '$$companyId'] }, { $eq: ['$branchId', '$$branchId'] }],
                            },
                        },
                    },
                ],
                as: 'shiftsInfo',
            },
        },
        { $unwind: { path: '$shiftsInfo', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                // shiftsInfo: '$shiftsInfo',
                email: '$usersInfo.email',
                // leavesInfo: '$leavesInfo',
                firstName: '$usersInfo.firstName',
                date: 1,
                empId: 1,
                inTime: 1,
                outTime: 1,
                workStatus: 1,
                createdById: 1,
                companyId: 1,
                shiftId: 1,
                branchId: 1,
                workHrs: 1,
                otHrs: 1,
                shortfallHours: 1,
                diff: 1,
                inTimeHourMinute: {
                    $dateToString: { format: '%H:%M', date: '$inTime' },
                },
                shiftInTimeHourMinute: {
                    $dateToString: {
                        format: '%H:%M',
                        date: '$shiftsInfo.sessions.first.inTime',
                    },
                },

                graceIn: '$shiftsInfo.sessions.first.graceIn',
                graceOut: '$shiftsInfo.sessions.second.graceOut',
                inMargin: '$shiftsInfo.sessions.first.inMargin',
                outMargin: '$shiftsInfo.sessions.second.outMargin',
                shiftInTime: '$shiftsInfo.sessions.first.inTime',
                shiftOutTime: '$shiftsInfo.sessions.second.outTime',
                shiftHours: '$shiftsInfo.fullDay',
            },
        },
    ])

    console.log(data, 'data================', data.length)
    // return false
    // data.length &&
    data.forEach(async (attendance) => {
        //used to compare user in/out time from shift in/out time.
        if (attendance.inTime > attendance.shiftInTime || attendance.outTime < attendance.shiftOutTime) {
            const monthValue = attendance.inTime.getMonth(), // (0 is January)
                dateValue = attendance.inTime.getDate(),
                // dayValue = attendance.inTime.getDay(), // (0 is Sunday)
                yearValue = attendance.inTime.getFullYear()

            attendance.shiftInTime = new Date(moment(attendance.shiftInTime).set('year', yearValue).set('month', monthValue).set('date', dateValue))
            attendance.shiftOutTime = new Date(moment(attendance.shiftOutTime).set('year', yearValue).set('month', monthValue).set('date', dateValue))

            const inTime = moment(attendance.inTime).diff(moment(attendance.shiftInTime), 'minutes') > 0 ? moment(attendance.inTime).diff(moment(attendance.shiftInTime), 'minutes') : 0

            const outTime = moment(attendance.shiftOutTime).diff(moment(attendance.outTime), 'minutes') > 0 ? moment(attendance.shiftOutTime).diff(moment(attendance.outTime), 'minutes') : 0

            if (attendance.graceIn < inTime) {
                let mailObj = ''

                mailObj += attendance.email + ','

                const printContents = {
                    toFirstName: 'All',
                    finalObj: attendance,
                    date: moment(data[0].date).format('ll'),
                }
                const options = {
                    to: mailObj,
                    subject: constants.email.shortFallAttendance,
                }

                await mailer.shortFall(options, printContents)
                // }
            } else if (attendance.graceOut < outTime) {
                //gracOut time compare with difference of user outTime and shift outTime.
                let mailObj = ''

                mailObj += attendance.email + ','

                const printContents = {
                    toFirstName: 'All',
                    finalObj: attendance,
                    date: moment(data[0].date).format('ll'),
                }
                const options = {
                    to: mailObj,
                    subject: constants.email.shortFallAttendance,
                }
                console.log(options, 'options')

                await mailer.shortFall(options, printContents)
                // }
            }
        } else if (attendance.workStatus == 'P') {
            //compare absent user with leaveApply
            let absentCondition = {
                empId: attendance.empId,
                companyId: mongoose.Types.ObjectId(attendance.companyId),
            }
            console.log(absentCondition, 'absentCondition')
            let leaveApplyInfo = await User.aggregate([
                { $match: absentCondition },
                {
                    $lookup: {
                        from: 'leaveapplies',
                        let: { userId: '$_id', companyId: '$companyId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [{ $eq: ['$createdById', '$$userId'] }, { $eq: ['$companyId', '$$companyId'] }],
                                    },
                                },
                            },
                        ],
                        as: 'leavesInfo',
                    },
                },
                { $unwind: { path: '$leavesInfo', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        isApproved: '$leavesInfo.isApproved',
                        startDate: '$leavesInfo.startDate',
                        endDate: '$leavesInfo.endDate',
                        _id: 1,
                        firstName: 1,
                    },
                },
            ])
            console.log('leaveApplyInfo', leaveApplyInfo)
        }
    })
})

exports.attendanceMailCron = async () => {
    const condition = { date: new Date(moment().subtract(1, 'day').format('YYYY-MM-DD')) }
    // const condition = { date: new Date(moment().format('YYYY-MM-DD')) }
    console.log('condition', condition)
    const data = await Attendance.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'users',
                let: { empId: '$empId', companyId: '$companyId' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [{ $eq: ['$empId', '$$empId'] }, { $eq: ['$companyId', '$$companyId'] }],
                            },
                        },
                    },
                ],
                as: 'usersInfo',
            },
        },
        { $unwind: { path: '$usersInfo', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'shifts',
                let: {
                    empShiftId: '$shiftId',
                    companyId: '$companyId',
                    branchId: '$branchId',
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [{ $eq: ['$_id', '$$empShiftId'] }, { $eq: ['$companyId', '$$companyId'] }, { $eq: ['$branchId', '$$branchId'] }],
                            },
                        },
                    },
                ],
                as: 'shiftsInfo',
            },
        },
        { $unwind: { path: '$shiftsInfo', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                email: '$usersInfo.email',
                firstName: '$usersInfo.firstName',
                date: 1,
                empId: 1,
                inTime: 1,
                outTime: 1,
                workStatus: 1,
                createdById: 1,
                companyId: 1,
                shiftId: 1,
                branchId: 1,
                workHrs: 1,
                otHrs: 1,
                shortfallHours: 1,
                diff: 1,
                inTimeHourMinute: {
                    $dateToString: { format: '%H:%M', date: '$inTime' },
                },
                shiftInTimeHourMinute: {
                    $dateToString: {
                        format: '%H:%M',
                        date: '$shiftsInfo.sessions.first.inTime',
                    },
                },

                graceIn: '$shiftsInfo.sessions.first.graceIn',
                graceOut: '$shiftsInfo.sessions.second.graceOut',
                inMargin: '$shiftsInfo.sessions.first.inMargin',
                outMargin: '$shiftsInfo.sessions.second.outMargin',
                shiftInTime: '$shiftsInfo.sessions.first.inTime',
                shiftOutTime: '$shiftsInfo.sessions.second.outTime',
                shiftHours: '$shiftsInfo.fullDay',
            },
        },
    ])
    const inOutMail = []
    const missMail = []
    data.forEach(async (attendance) => {
        if (attendance.inTime > attendance.shiftInTime || attendance.outTime < attendance.shiftOutTime) {
            const monthValue = attendance.inTime.getMonth(),
                dateValue = attendance.inTime.getDate(),
                yearValue = attendance.inTime.getFullYear()

            attendance.shiftInTime = new Date(moment(attendance.shiftInTime).set('year', yearValue).set('month', monthValue).set('date', dateValue))
            attendance.shiftOutTime = new Date(moment(attendance.shiftOutTime).set('year', yearValue).set('month', monthValue).set('date', dateValue))

            const inTime = moment(attendance.inTime).diff(moment(attendance.shiftInTime), 'minutes') > 0 ? moment(attendance.inTime).diff(moment(attendance.shiftInTime), 'minutes') : 0

            const outTime = moment(attendance.shiftOutTime).diff(moment(attendance.outTime), 'minutes') > 0 ? moment(attendance.shiftOutTime).diff(moment(attendance.outTime), 'minutes') : 0
            if (attendance.graceIn < inTime || attendance.graceOut < outTime) {
                inOutMail.push(attendance.email)
            } else if (attendance.graceOut === null || attendance.graceIn === null) {
                missMail.push(attendance.email)
            }
        }
    })
    const msg = {
        to: inOutMail,
        from: 'shivam.zimo@outlook.com',
        subject: 'Warning You are not following office time',
        text: 'nothing',
        html: mailer.inOutMail.html,
    }

    await sgMail
        .send(msg)
        .then((response) => {
            console.log(response[0].statusCode)
            console.log(response[0].headers)
        })
        .catch((error) => {
            console.error(error.response.body.errors)
        })

    const msgg = {
        to: missMail,
        from: 'shivam.zimo@outlook.com',
        subject: 'Warning You have missed attendance',
        text: 'nothing',
        html: mailer.missedEmail.html,
    }
    await sgMail
        .send(msgg)
        .then((response) => {
            console.log(response[0].statusCode)
            console.log(response[0].headers)
        })
        .catch((error) => {
            console.error(error.response.body.errors)
        })
}

exports.attendanceLateMailCron = async () => {
    const condition = { date: new Date(moment().subtract(1, 'day').format('YYYY-MM-DD')) }
    console.log('condition', condition)
    const data = await Attendance.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'users',
                let: { empId: '$empId', companyId: '$companyId' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [{ $eq: ['$empId', '$$empId'] }, { $eq: ['$companyId', '$$companyId'] }],
                            },
                        },
                    },
                ],
                as: 'usersInfo',
            },
        },
        { $unwind: { path: '$usersInfo', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'leaveapplies',
                let: { createdById: '$usersInfo._id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [{ $eq: ['$createdById', '$$createdById'] }],
                            },
                        },
                    },
                ],
                as: 'leaveInfo',
            },
        },
        { $unwind: { path: '$leaveInfo', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'shifts',
                let: {
                    empShiftId: '$shiftId',
                    companyId: '$companyId',
                    branchId: '$branchId',
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [{ $eq: ['$_id', '$$empShiftId'] }, { $eq: ['$companyId', '$$companyId'] }, { $eq: ['$branchId', '$$branchId'] }],
                            },
                        },
                    },
                ],
                as: 'shiftsInfo',
            },
        },
        { $unwind: { path: '$shiftsInfo', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                email: '$usersInfo.email',
                firstName: '$usersInfo.firstName',
                date: 1,
                empId: 1,
                leaveStartDate: '$leaveInfo.startDate',
                leaveEndDate: '$leaveInfo.endDate',
                leaveIsApproved: '$leaveInfo.isApproved',
                inTime: 1,
                outTime: 1,
                workStatus: 1,
                createdById: 1,
                companyId: 1,
                shiftId: 1,
                branchId: 1,
                workHrs: 1,
                otHrs: 1,
                shortfallHours: 1,
                diff: 1,
                inTimeHourMinute: {
                    $dateToString: { format: '%H:%M', date: '$inTime' },
                },
                shiftInTimeHourMinute: {
                    $dateToString: {
                        format: '%H:%M',
                        date: '$shiftsInfo.sessions.first.inTime',
                    },
                },
                graceIn: '$shiftsInfo.sessions.first.graceIn',
                graceOut: '$shiftsInfo.sessions.second.graceOut',
                inMargin: '$shiftsInfo.sessions.first.inMargin',
                outMargin: '$shiftsInfo.sessions.second.outMargin',
                shiftInTime: '$shiftsInfo.sessions.first.inTime',
                shiftOutTime: '$shiftsInfo.sessions.second.outTime',
                shiftHours: '$shiftsInfo.fullDay',
            },
        },
    ])
    console.log(data)
    let absentMail = []

    data.forEach((data) => {
        let date = condition.date
        let leaveStartDate = data.leaveStartDate
        let leaveEndDate = data.leaveEndDate
        if (data.workStatus === 'A') {
            if (leaveStartDate !== undefined && leaveStartDate !== null) {
                if (date >= leaveStartDate && date <= leaveEndDate && data.leaveIsApproved === 'Approved') {
                    return
                } else {
                    absentMail.push(data.email)
                }
            }
        }
    })
    const email = 'piyush.zimo@outlook.com'
    absentMail.push(email)
    console.log(absentMail)
    const msg = {
        to: absentMail,
        from: 'shivam.zimo@outlook.com',
        subject: 'Warning You was absent tomorrow',
        text: 'nothing',
        html: mailer.absentMail.html,
    }

    await sgMail
        .send(msg)
        .then((response) => {
            console.log(response[0].statusCode)
            console.log(response[0].headers)
        })
        .catch((error) => {
            console.error(error.response.body.errors)
        })
}
