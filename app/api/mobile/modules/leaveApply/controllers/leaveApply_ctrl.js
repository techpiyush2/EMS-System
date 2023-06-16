const { internalError } = require('../../../../../lib/response'),
    catchAsync = require('../../../../../lib/catchAsync'),
    Response = require('../../../../../lib/response'),
    toggleStatus = require('./../../../../v1/modules/factory/changeStatus'),
    constants = require('../../../../../lib/constants'),
    softDelete = require('./../../../../v1/modules/factory/softDelete'),
    { leaveApplyValidation } = require('./../../../../../lib/joiValidation'),
    LeaveApply = require('./../../../../v1/modules/leaveApply/models/leaveApply_model'),
    Leave = require('./../../../../v1/modules/leave/models/leavePolicy_model'),
    Company = require('../../../../v1/modules/company/models/company_model'),
    User = require('./../../../../v1/modules/user/models/user_model'),
    Shift = require('./../../../../v1/modules/shifts/models/shifts_model'),
    mailer = require('./../../../../../lib/mailer'),
    config = require('.././../../../../config/config').get(process.env.NODE_ENV),
    mongoose = require('mongoose'),
    moment = require('moment')

exports.addLeaveApply = catchAsync(async (req, res, next) => {
    let validateObj = {
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        reason: req.body.reason,
        leaveType: req.body.leaveType,
    }

    await leaveApplyValidation.validateAsync(validateObj)
    const { createdById, companyId, leaveType, session } = req.body
    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))
    if (!companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))
    if (!session) return res.json(Response(constants.statusCode.unauth, constants.leaveApplyMsg.session))

    validateObj.createdById = createdById
    validateObj.companyId = companyId
    validateObj.session = session
    const leaveApplyInfo = await LeaveApply.create(validateObj)

    const condition = {
        createdById: mongoose.Types.ObjectId(req.body.companyId),
    }
    const companyObj = await Company.findOne(condition, { _id: 1, logo: 1 })
    const leaveObj = await Leave.findOne(
        { companyId: validateObj.companyId },

        { _id: 1, name: 1 }
    )
    const shiftObj = await Shift.findOne(
        {
            companyId: validateObj.companyId,
        },

        { _id: 1, sessions: 1 }
    )

    const nameObj = await User.findOne({ companyId: validateObj.companyId, _id: validateObj.createdById }, { _id: 1, firstName: 1, empId: 1 })
    const printContents = {
        Name: nameObj.firstName,
        logo: companyObj.logo,
        imageUrl: config.backendUrl,
        Employee_id: nameObj.empId,
        LeaveName: leaveObj.name,
        Start_date: moment(leaveApplyInfo.startDate).format('ll'),
        Session1: 'Session1' + ' ' + '(' + shiftObj.sessions.first.inTime + '-' + shiftObj.sessions.first.outTime + ')',
        End_Date: moment(leaveApplyInfo.endDate).format('ll'),
        Session2: 'Session2' + ' ' + '(' + shiftObj.sessions.second.inTime + '-' + shiftObj.sessions.second.outTime + ')',
        Reason: leaveApplyInfo.reason,
        view_request: req.body.isActive == true ? config.frontEndURL + 'EmpDashboard' : config.frontEndURL + 'Login',
    }

    const options = {
        to: ['hr@yopmail.com', 'jj@yopmail.com'],
        subject: constants.email.leaveApplyEmail,
    }
    const mailResponse = await mailer.applyLeave(options, printContents)
    if (leaveApplyInfo || mailResponse) {
        return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
    } else {
        return res.json(Response(constants.statusCode.internalServerError, constants.statusCode.internalError))
    }
})
