const { constant, forEach } = require('async')
const { aggregate } = require('./../models/leaveApply_model')

const Response = require('../../../../../lib/response'),
    catchAsync = require('./../../../../../lib/catchAsync'),
    toggleStatus = require('./../../factory/changeStatus'),
    constants = require('./../../../../../lib/constants'),
    query = require('./../../../../../lib/common_query'),
    softDelete = require('./../../factory/softDelete'),
    { leaveApplyValidation, leaveApplyUpdateValidation } = require('./../../../../../lib/joiValidation'),
    LeaveApply = require('./../../leaveApply/models/leaveApply_model'),
    Leave = require('./../../leave/models/leavePolicy_model'),
    User = require('./../../user/models/user_model'),
    Shift = require('./../../shifts/models/shifts_model'),
    UserLeaveHistory = require('../../user/models/userLeaveHistory'),
    Company = require('./../../company/models/company_model'),
    Roles = require('./../../role/models/role_model'),
    mailer = require('./../../../../../lib/mailer'),
    config = require('.././../../../../config/config').get(process.env.NODE_ENV),
    mongoose = require('mongoose')
const moment = require('moment')
const Employee = require('../../employee/models/empPersonalDetail_model')
console.log(new Date(moment(new Date()).add(1, 'month')))

exports.addLeaveApply = catchAsync(async (req, res) => {
    req.body.startDate = moment(new Date(req.body.startDate)).format('YYYY-MM-DD')
    req.body.endDate = moment(new Date(req.body.endDate)).format('YYYY-MM-DD')

    // Check if already exist
    const isExist = await LeaveApply.findOne({ companyId: req.body.companyId, createdById: req.body.createdById, startDate: req.body.startDate, endDate: req.body.endDate, leaveType: req.body.leaveType })
    if (isExist) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))

    // Validation
    let validateObj = { startDate: req.body.startDate, endDate: req.body.endDate, reason: req.body.reason, leaveType: req.body.leaveType, createdById: req.body.createdById, companyId: req.body.companyId, session: req.body.session, appliedTo: req.body.appliedTo, branchId: req.body.branchId }
    await leaveApplyValidation.validateAsync(validateObj)

    // let EndDate = moment(validateObj.endDate)
    // let StartDate = moment(validateObj.startDate).subtract(1, 'days')
    validateObj.noOfLeaves = moment(validateObj.endDate).diff(moment(validateObj.startDate).subtract(1, 'days'), 'days')

    if (req.body.session == 'fullDay') validateObj.noOfLeaves = validateObj.noOfLeaves * 1
    else validateObj.noOfLeaves = validateObj.noOfLeaves * 0.5
    // //sandwich
    // const sandwichObj = await Leave.find({ companyId: validateObj.companyId, _id: validateObj.leaveType }, { _id: 1, name: 1, isSandwich: 1, isIncludeHoliday: 1 })

    // const weekDaysObj = await Employee.find({ createdById: validateObj.createdById }, {})
    // console.log('sandwichObj', sandwichObj, 'weekDaysObj', weekDaysObj)

    // return false

    let temp = []

    for (var m = moment(validateObj.startDate); m.isSameOrBefore(validateObj.endDate); m.add(1, 'days')) {
        let date = moment(new Date(m)).format('YYYY-MM-DD')
        let day = moment(new Date(m)).format('dddd')
        temp.push({ leaveDate: date, dayName: day })
    }
    console.log('=========================')

    validateObj.leaveDetails = temp

    //sandwich leave calculate

    // const holidayData = await Holiday.find()
    let leaveApplyInfo = await LeaveApply.create(validateObj)
    console.log(leaveApplyInfo, 'leaveApplyInfo')
    const leaveObj = await Leave.findOne({ companyId: validateObj.companyId, _id: leaveApplyInfo.leaveType }, { _id: 1, name: 1 })

    const companyObj = await Company.findOne({ createdById: validateObj.companyId }, { _id: 1, logo: 1 })

    const appliedToHrObj = await User.find({ _id: req.body.appliedTo }, { email: 1 })

    const printContents = {
        Name: req.body.name,
        Employee_id: req.body.empId,
        LeaveName: leaveObj.name,
        Start_date: moment(leaveApplyInfo.startDate).format('ll'),
        session: leaveApplyInfo.session,
        logo: companyObj.logo,
        End_Date: moment(leaveApplyInfo.endDate).format('ll'),
        Reason: leaveApplyInfo.reason,
        view_request: config.adminBaseUrl,
    }
    let sendTo = []
    appliedToHrObj.forEach((user) => sendTo.push(user.email))
    let options = { to: sendTo, subject: constants.email.leaveApplyEmail }

    const mailResponse = await mailer.applyLeave(options, printContents)
    if (leaveApplyInfo || mailResponse) return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
    else return res.json(Response(constants.statusCode.internalServerError, constants.statusCode.internalError))
})
exports.isExistReporting = catchAsync(async (req, res) => {
    const userRes = await User.findOne({
        _id: req.body._id,
        companyId: req.body.companyId,
        createdById: req.body.createdById,
    })

    if (!userRes.reportingManager) return res.json(Response(constants.statusCode.unauth, constants.messages.assignReportingManager))
    else return res.json(Response(constants.statusCode.ok, constants.messages.existReportingManager))
})
exports.leaveApplyList = catchAsync(async (req, res) => {
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

    if (req.body.searchText) {
        const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')
        child_condition.$or = [{ empId: new RegExp(searchText, 'gi') }, { leaveName: new RegExp(searchText, 'gi') }, { userName: new RegExp(searchText, 'gi') }]
    }
    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
    if (req.body.leaveType) condition.leaveType = mongoose.Types.ObjectId(req.body.leaveType)
    if (req.body.createdById) condition.createdById = mongoose.Types.ObjectId(req.body.createdById)
    if (req.body.startDate && req.body.endDate)
        child_condition.$or = [{ endDate: { $gte: new Date(req.body.startDate), $lte: new Date(req.body.endDate) } }, { startDate: { $gte: new Date(req.body.startDate), $lte: new Date(req.body.endDate) } }, { startDate: { $lt: new Date(req.body.startDate), $lt: new Date(req.body.endDate) }, endDate: { $gt: new Date(req.body.startDate), $gt: new Date(req.body.endDate) } }]

    if (req.body.userId) condition = { appliedTo: { $in: [mongoose.Types.ObjectId(req.body.userId)] } }

    if (req.body.status) condition.isApproved = req.body.status

    const data = await LeaveApply.aggregate([
        { $match: condition },
        { $lookup: { from: 'leavepolicies', localField: 'leaveType', foreignField: '_id', as: 'leavesData' } },
        { $unwind: { path: '$leavesData', preserveNullAndEmptyArrays: true } },

        { $lookup: { from: 'branches', localField: 'branchId', foreignField: '_id', as: 'branchData' } },
        { $unwind: { path: '$branchData', preserveNullAndEmptyArrays: true } },

        { $lookup: { from: 'users', localField: 'createdById', foreignField: '_id', as: 'userInfo' } },
        { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                empId: '$userInfo.empId',
                roleId: '$userInfo.roleId',
                reason: '$reason',
                session: '$session',
                endDate: '$endDate',
                userName: '$userInfo.firstName',
                branchId: '$branchId',
                appliedTo: 1,
                startDate: '$startDate',
                leaveType: '$leaveType',
                companyId: '$companyId',
                createdAt: 1,
                leaveName: '$leavesData.name',
                noOfLeaves: 1,
                isApproved: '$isApproved',
                branchName: '$branchData.branchName',
                createdById: '$createdById',
                leaveDetails: 1,
                reportingManager: '$userInfo.reportingManager',
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await LeaveApply.countDocuments({ ...condition, ...child_condition })

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

exports.approveLeave = catchAsync(async (req, res) => {
    if (!req.body.leave_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    if (!req.body.createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))
    if (!req.body.isApproved) return res.json(Response(constants.statusCode.unauth, constants.messages.status))
    if (!req.body.approvedbyId) return res.json(Response(constants.statusCode.unauth, constants.messages.appliedTo))
    const { leave_id, createdById, isApproved, approvedbyId } = req.body
    const leave_condition = { _id: leave_id, createdById: createdById }
    // Check if Leave exist and not Approved
    const leaveObj = await LeaveApply.findOne(leave_condition, {})
    if (!leaveObj) return res.json(Response(constants.statusCode.unauth, constants.messages.notApprove))
    if (leaveObj.isApproved != 'PENDING') return res.json(Response(constants.statusCode.unauth, constants.messages.alreadyApprove(leaveObj.isApproved)))

    leaveObj.isApproved = isApproved

    leaveObj.save(async function (err) {
        if (err) res.json(Response(constants.statusCode.internalServerError, err))
        else {
            // Update Leave to Approved
            const updatedObj = await LeaveApply.findOneAndUpdate({ _id: leave_id }, {})

            if (!updatedObj) return res.json(Response(constants.statusCode.internalServerError, constants.messages.acceptedMailNotSend))
            const user_condition = { $or: [{ _id: mongoose.Types.ObjectId(approvedbyId) }, { _id: mongoose.Types.ObjectId(leaveObj.createdById) }] }
            const userData = await User.aggregate([{ $match: user_condition }])

            let appliedByData = {}
            let approvedByData = {}
            userData.forEach((user) => {
                if (user._id == approvedbyId) approvedByData = user
                if (user._id == leaveObj.createdById.toString()) appliedByData = user
            })
            let printContents = { appliedByName: appliedByData.firstName + ' ' + appliedByData.lastName, approvedByName: approvedByData.firstName + ' ' + approvedByData.lastName, leaveStatus: leaveObj.isApproved }

            const options = { to: appliedByData.email, subject: constants.mailSubject.invitationConfirmation }

            const mailResponse = await mailer.acceptanceConfirmation(options, printContents)

            if (mailResponse) return res.json(Response(constants.statusCode.ok, constants.messages.mailSend))
            else return res.json(Response(constants.statusCode.internalError, constants.messages.acceptedMailNotSend))
        }
    })
})
exports.leaveApplyDetail = catchAsync(async (req, res, next) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = { _id: mongoose.Types.ObjectId(req.body._id) }

    const data = await LeaveApply.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'leavepolicies',
                localField: 'leaveType',
                foreignField: '_id',
                as: 'leavesData',
            },
        },

        { $unwind: { path: '$leavesData', preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: 'users',
                localField: 'createdById',
                foreignField: '_id',
                as: 'userInfo',
            },
        },

        { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'users',
                localField: 'appliedToHr',
                foreignField: '_id',
                as: 'hrInfo',
            },
        },

        { $unwind: { path: '$hrInfo', preserveNullAndEmptyArrays: true } },

        {
            $project: {
                reason: '$reason',

                leaveType: '$leaveType',
                createdById: '$createdById',
                companyId: '$companyId',
                leaveName: '$leavesData.name',
                userName: '$userInfo.firstName',
                empId: '$userInfo.empId',
                startDate: 1,
                endDate: 1,
                createdAt: 1,
                session: 1,
                noOfLeaves: 1,
                leaveDetails: 1,
                hrName: '$hrInfo.firstName',
            },
        },
    ])
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})
exports.withdrawLeave = catchAsync(async (req, res) => {
    if (!req.body.leave_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    if (!req.body.createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))
    if (!req.body.isApproved) return res.json(Response(constants.statusCode.unauth, constants.messages.status))
    if (!req.body.reason) return res.json(Response(constants.statusCode.unauth, constants.leaveApplyMsg.reason))

    const { leave_id, createdById, isApproved, reason } = req.body
    const leave_condition = { _id: leave_id, createdById: createdById }

    // Check if Leave exist and not Approved
    const leaveObj = await LeaveApply.findOne(leave_condition, {})
    if (!leaveObj) return res.json(Response(constants.statusCode.unauth, constants.messages.dataFound))
    if (leaveObj.isApproved == isApproved) return res.json(Response(constants.statusCode.unauth, constants.messages.alreadyApprove(isApproved)))

    leaveObj.isApproved = isApproved
    leaveObj.reason = reason

    leaveObj.save(async function (err) {
        if (err) res.json(Response(constants.statusCode.internalServerError, err))
        else {
            // Update Leave to Approved
            const updatedObj = await LeaveApply.findOneAndUpdate({ _id: leave_id }, {})

            if (!updatedObj) return res.json(Response(constants.statusCode.internalServerError, constants.messages.acceptedMailNotSend))
            const user_condition = { $or: [{ _id: mongoose.Types.ObjectId(leaveObj.createdById) }] }
            const userData = await User.aggregate([{ $match: user_condition }])

            let appliedByData = {}

            userData.forEach((user) => {
                if (user._id == leaveObj.createdById.toString()) appliedByData = user
            })
            let printContents = { appliedByName: appliedByData.firstName + ' ' + appliedByData.lastName, leaveStatus: leaveObj.isApproved, leaveReason: leaveObj.reason }

            const options = { to: ['hr@yopmail.com', 'jj@yopmail.com'], subject: constants.mailSubject.withdraw }

            const mailResponse = await mailer.withdrawConfirmation(options, printContents)

            if (mailResponse) return res.json(Response(constants.statusCode.ok, constants.messages.mailSend))
            else return res.json(Response(constants.statusCode.internalError, constants.messages.acceptedMailNotSend))
        }
    })
})
exports.leaveOverviewList = catchAsync(async (req, res) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.ok, constants.messages.idReq))
    if (!req.body.companyId) return res.json(Response(constants.statusCode.ok, constants.messages.companyNot))

    let count = req.body.count ? req.body.count : 10
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)

    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { name: 1 }
    }
    const child_condition = {},
        condition = { _id: mongoose.Types.ObjectId(req.body._id), companyId: mongoose.Types.ObjectId(req.body.companyId) }

    if (req.body.leaveId) child_condition['leavesData._id'] = mongoose.Types.ObjectId(req.body.leaveId)

    const data = await User.aggregate([
        { $match: condition },

        { $lookup: { from: 'employees', localField: '_id', foreignField: 'createdById', as: 'employeeData' } },
        { $unwind: '$employeeData' },

        { $lookup: { from: 'leavepolicies', localField: 'department', foreignField: 'applicable.departments.departmentsId', as: 'leavesData' } },
        { $unwind: '$leavesData' },
        { $match: child_condition },

        { $lookup: { from: 'shifts', localField: 'employeeData.shift', foreignField: '_id', as: 'shiftData' } },
        { $unwind: '$shiftData' },
        { $lookup: { from: 'holidays', localField: 'employeeData.shift', foreignField: 'shifts', as: 'holidayData' } },
        // { $unwind: '$holidayData' },

        { $lookup: { from: 'leaveapplies', let: { leaveCreated: '$_id', leaveId: '$leavesData._id' }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$createdById', '$$leaveCreated'] }, { $eq: ['$isApproved', 'APPROVED'] }, { $eq: ['$leaveType', '$$leaveId'] }] } } }, { $group: { _id: null, sum: { $sum: '$noOfLeaves' } } }], as: 'leaveApplyData' } },
        { $unwind: { path: '$leaveApplyData', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                leaveId: '$leavesData._id',
                leaveName: '$leavesData.name',
                entitled: '$leavesData.entitleMent.entitled',
                color: '$leavesData.color',
                count: '$leaveApplyData.isApproved',
                noOfDays: '$leaveApplyData.noOfLeaves',
                dateOfJoining: '$employeeData.dateOfJoining',
                leaveEffectiveValue: '$leavesData.entitleMent.effectiveAfter.value',
                leaveEffectiveUnit: '$leavesData.entitleMent.effectiveAfter.unit',
                leaveEffectiveFrom: '$leavesData.entitleMent.effectiveAfter.from',
                shiftData: '$shiftData.days',
                holidayData: '$holidayData',
                dateOfConfirmation: '$employeeData.dateOfConfirmation',
                calculatedDate: { $cond: { if: { $eq: ['$leavesData.entitleMent.effectiveAfter.from', 'CONFIRMATION_DATE'] }, then: '$employeeData.dateOfConfirmation', else: '$employeeData.dateOfJoining' } },
                approvedLeaved: { $cond: { if: { $gt: ['$leaveApplyData.sum', 0] }, then: '$leaveApplyData.sum', else: 0 } },

                balanceLeave: {
                    $cond: {
                        if: { $gt: ['$leaveApplyData.sum', 0] },
                        then: { $subtract: ['$leavesData.entitleMent.entitled', '$leaveApplyData.sum'] },
                        else: '$leavesData.entitleMent.entitled',
                    },
                },
            },
        },
    ])
    const arr = []
    data.forEach((el) => {
        if (moment(new Date(el.calculatedDate)).add(el.leaveEffectiveValue, el.leaveEffectiveUnit == 'YEAR' ? 'year' : 'month') > moment(new Date())) {
            el.entitled = 0
            el.balanceLeave = 0
        }
        arr.push(el)
    })

    const totalCount = await User.countDocuments({ ...condition, ...child_condition })

    if (arr.length) {
        return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, arr, totalCount))
    } else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})
exports.leaveApplyUpdate = catchAsync(async (req, res) => {
    console.log(req.body)
    const { _id } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let validateObj = {
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        reason: req.body.reason,
        leaveType: req.body.leaveType,
        session: req.body.session,
        // branchId: req.body.branchId,
    }

    await leaveApplyUpdateValidation.validateAsync(validateObj)
    // const { session } = req.body

    // if (!session) return res.json(Response(constants.statusCode.unauth, constants.leaveApplyMsg.empId))

    // validateObj.session = session

    // validateObj.leaveType = leaveType

    const Result = await LeaveApply.findByIdAndUpdate(_id, validateObj, {
        new: true,
    })
    if (Result) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
})
exports.viewDetailList = catchAsync(async (req, res) => {
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
    let condition = {}
    if (req.body.isActive != '' && req.body.isActive != undefined) {
        condition.isActive = req.body.isActive == 'true' ? true : false
    }
    const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')
    if (req.body.searchText) {
        child_condition.$or = [{ name: new RegExp(searchText, 'gi') }]
    }

    if (req.body.leaveType) {
        condition.leaveType = mongoose.Types.ObjectId(req.body.leaveType)
    }
    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
    if (req.body.createdById) condition.createdById = mongoose.Types.ObjectId(req.body.createdById)
    const data = await LeaveApply.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'leaves',
                localField: 'leaveType',
                foreignField: '_id',
                as: 'leavesData',
            },
        },

        { $unwind: { path: '$leavesData', preserveNullAndEmptyArrays: true } },

        { $lookup: { from: 'shifts', localField: 'session1', foreignField: '_id', as: 'shiftData' } },
        {
            $lookup: {
                from: 'branches',
                localField: 'branchId',
                foreignField: '_id',
                as: 'branchData',
            },
        },
        { $unwind: { path: '$branchData', preserveNullAndEmptyArrays: true } },

        { $unwind: { path: '$shiftData', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'users',
                localField: 'createdById',
                foreignField: '_id',
                as: 'userInfo',
            },
        },
        { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                isApproved: '$isApproved',
                reason: '$reason',
                startDate: '$startDate',
                endDate: '$endDate',
                session: '$session',
                leaveType: '$leaveType',
                branchId: '$branchId',
                createdById: '$createdById',
                companyId: '$companyId',
                leaveName: '$leavesData.name',
                branchName: '$branchData.branchName',
                session1: '$shiftData.sessions.first',
                session2: '$shiftData.sessions.second',
                userName: '$userInfo.firstName',
                empId: '$userInfo.empId',
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])

    const totalCount = await LeaveApply.countDocuments({
        ...condition,
        ...child_condition,
    })

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

exports.applyToList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 20
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
        child_condition.$or = [{ firstName: new RegExp(searchText, 'gi') }]
    }

    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }
    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)

    const data = await User.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'designations',
                localField: 'designation',
                foreignField: '_id',
                as: 'designationData',
            },
        },
        {
            $project: {
                firstName: '$firstName',
                designation: '$designationData.title',
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await User.countDocuments({
        ...condition,
        ...child_condition,
    })
    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})