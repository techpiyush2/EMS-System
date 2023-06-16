const Response = require('../../../../../lib/response'),
    catchAsync = require('./../../../../../lib/catchAsync'),
    toggleStatus = require('./../../factory/changeStatus'),
    constants = require('./../../../../../lib/constants'),
    query = require('./../../../../../lib/common_query'),
    softDelete = require('./../../factory/softDelete'),
    { policyValidation, updatePolicyValidation } = require('./../../../../../lib/joiValidation'),
    Policy = require('./../models/companyPolicy_model'),
    EmployeeData = require('../../employee/models/empPersonalDetail_model'),
    User = require('../../user/models/user_model'),
    mongoose = require('mongoose')
const Employee = require('../../employee/models/empPersonalDetail_model')

exports.policyAdd = catchAsync(async (req, res, next) => {
    let validateObj = {
        name: req.body.name,
        code: req.body.code,
        description: req.body.description,
        file: req.body.file,
    }

    const userRes = await Policy.findOne({
        name: req.body.name,
        companyId: req.body.companyId,
    })
    if (userRes) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))

    await policyValidation.validateAsync(validateObj)
    const { createdById, companyId, designations, departments, progressBarLength, percentageData } = req.body

    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))
    if (!companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))

    if (!departments) return res.json(Response(constants.statusCode.unauth, constants.departmentMsg.departmentIdReq))
    if (!designations) return res.json(Response(constants.statusCode.unauth, constants.designationMsg.idReq))
    validateObj.createdById = createdById
    validateObj.companyId = companyId
    validateObj.designations = designations
    validateObj.departments = departments

    let policyInfo = await Policy.create(validateObj)

    const { userId } = req.body
    let updatePercentage = await User.findByIdAndUpdate({ _id: userId }, { isAddPolicy: true, percentageData: req.body.percentageData })

    if (policyInfo) {
        return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
    } else {
        return res.json(Response(constants.statusCode.internalServerError, constants.statusCode.internalError))
    }
})
exports.policyList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 10
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)

    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { brand: 1 }
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
    const data = await Policy.aggregate([
        { $match: condition },
        {
            $project: {
                name: '$name',
                code: '$code',
                description: '$description',
                enforcePolicy: '$enforcePolicy',
                file: '$file',
                companyId: '$companyId',
                createdById: '$createdById',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await Policy.countDocuments({
        ...condition,
        ...child_condition,
    })
    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

exports.policyUpdate = catchAsync(async (req, res) => {
    const { _id } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let validateObj = {
        name: req.body.name,
        code: req.body.code,
        description: req.body.description,
        enforcePolicy: req.body.enforcePolicy,
        file: req.body.file,
        departments: req.body.departments,
        designations: req.body.designations,
    }

    await updatePolicyValidation.validateAsync(validateObj)

    const Result = await Policy.findByIdAndUpdate(_id, validateObj, {
        new: true,
    })
    if (Result) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
})
exports.policyDetail = catchAsync(async (req, res, next) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = { _id: mongoose.Types.ObjectId(req.body._id) }

    const data = await Policy.aggregate([
        { $match: condition },
        {
            $project: {
                name: '$name',
                code: '$code',
                description: '$description',
                enforcePolicy: '$enforcePolicy',
                file: '$file',
                departments: '$departments',
                designations: '$designations',
                companyId: '$companyId',
                createdById: '$createdById',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
            },
        },
    ])
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})
exports.empAcceptPolicy = catchAsync(async (req, res) => {
    const { createdById } = req.body

    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = {
        createdById: mongoose.Types.ObjectId(req.body.createdById),
    }

    let validateObj = {
        empPolicy: req.body.empPolicy,
    }
    if (!validateObj.empPolicy) return res.json(Response(constants.statusCode.unauth, constants.messages.empPolicy))
    const Result = await EmployeeData.findOneAndUpdate(condition, validateObj, {
        new: true,
    })
    if (Result) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
})
exports.delete = softDelete(Policy)
exports.changeStatus = toggleStatus(Policy)
