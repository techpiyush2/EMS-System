'use strict'

const Response = require('../../../../../lib/response'),
    catchAsync = require('./../../../../../lib/catchAsync'),
    toggleStatus = require('./../../factory/changeStatus'),
    constants = require('./../../../../../lib/constants'),
    toggleDeletedRole = require('./../../factory/update'),
    query = require('./../../../../../lib/common_query'),
    softDelete = require('./../../factory/softDelete'),
    updateRole = require('./../../factory/update'),
    { roleValidation } = require('./../../../../../lib/joiValidation'),
    Roles = require('../models/role_model')

exports.addRole = catchAsync(async (req, res, next) => {
    const { roleTitle } = req.body

    if (!req.body.roleTitle) return res.json(Response(constants.statusCode.unauth, constants.roleMsg.titleReq))

    const existCond = { roleTitle }
    const isExist = await Roles.findOne(existCond, {
        roleTitle: roleTitle,
        isDeleted: 1,
        isActive: 1,
    })

    if (isExist && !isExist.isDeleted)
        // Qualification type exist and not deleted
        return res.json(Response(constants.statusCode.alreadyExist, constants.messages.exist))

    if (isExist && isExist.isDeleted) {
        // Qualification  type exist but its flag isDeleted == true
        const isUpdated = await Roles.findByIdAndUpdate(isExist._id, {
            roleTitle: roleTitle,
            isActive: true,
            isDeleted: false,
        })

        if (isUpdated) return res.json(Response(constants.statusCode.ok, constants.roleMsg.roleUpdate))
        else return res.json(internalError())
    }
    let validateObj = {
        roleTitle: req.body.roleTitle,
        roleName: req.body.roleName,
    }

    await roleValidation.validateAsync(validateObj)
    const { createdById } = req.body

    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))

    validateObj.createdById = createdById

    let roleInfo = await Roles.create(validateObj)

    if (roleInfo) {
        return res.json(Response(constants.statusCode.ok, constants.roleMsg.roleAdded))
    } else {
        return res.json(Response(constants.statusCode.internalservererror, constants.messages.internalServerError))
    }
})

exports.rolesList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 10
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)

    let child_condition = {}
    let condition = { isDeleted: false }
    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { roleName: 1 }
    }

    if (req.body.isActive != '' && req.body.isActive != undefined) {
        condition.isActive = req.body.isActive == 'true' ? true : false
    }

    const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')

    if (req.body.searchText) {
        child_condition.$or = [{ roleName: new RegExp(searchText, 'gi') }]
    }

    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }
    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
    if (req.body.createdById) condition.createdById = mongoose.Types.ObjectId(req.body.createdById)

    const data = await Roles.aggregate([
        { $match: condition },
        {
            $project: {
                _id: '$_id',
                roleTitle: 1,
                roleName: 1,
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                companyId: '$companyId',
                createdById: '$createdById',
            },
        },
        {
            $match: child_condition,
        },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])

    const totalCount = await Roles.countDocuments({
        ...condition,
        ...child_condition,
    })

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

exports.updateData = (req, res, next) => {
    if (Object.keys(req.body).length === 0 && req.body.constructor === Object) return res.json(Response(constants.statusCode.unauth, constants.messages.requiredFieldsMissing))
    if (!req.body.roleId) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    if (!req.body.roleName) return res.json(Response(constants.statusCode.unauth, constants.roleMsg.roleNameReq))
    if (!req.body.roleTitle) return res.json(Response(constants.statusCode.unauth, constants.roleMsg.titleReq))

    const updateData = {
        roleName: req.body.roleName,
        roleTitle: req.body.roleTitle,
    }
    const { roleId } = req.body
    const data = { model: Roles, id: roleId, updateData }

    updateRole(req, res, next, data)
}

exports.details = catchAsync(async (req, res) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    const condition = { _id: req.body._id }
    const fields = { roleTitle: 1, roleName: 1, createdAt: 1 }
    const finalResult = await query.findoneData(Roles, condition, fields)

    if (!finalResult.status) return res.json(Response(constants.statusCode.internalservererror, constants.messages.internalServerError))

    if (finalResult.data) {
        return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, finalResult.data))
    } else {
        return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
    }
})

exports.changeStatus = toggleStatus(Roles)

exports.deleteRole = softDelete(Roles)
