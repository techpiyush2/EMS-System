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
    RoleAndPermission = require('../models/role_permission_model')

exports.addRolesAndPermissions = catchAsync(async (req, res, next) => {
    let validateObj = {
        title: req.body.title,
        permissions: req.body.permissions,
    }

    //To Prevent Dublicacy
    const permissionsRes = await RoleAndPermission.findOne({ title: req.body.title })
    if (permissionsRes) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))

    //await domainValidation.validateAsync(validateObj);

    const { createdById, companyId } = req.body

    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))
    if (!companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))

    validateObj.createdById = createdById
    validateObj.companyId = companyId

    let PermissionsInfo = await RoleAndPermission.create(validateObj)
    if (PermissionsInfo) {
        return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
    } else {
        return res.json(Response(constants.statusCode.internalServerError, constants.statusCode.internalError))
    }
})

exports.rolesAndPermissionList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 10
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)

    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { title: 1 }
    }
    let child_condition = {}
    let condition = {}
    if (req.body.isActive != '' && req.body.isActive != undefined) {
        condition.isActive = req.body.isActive == 'true' ? true : false
    }
    const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')
    if (req.body.searchText) {
        child_condition.$or = [{ title: new RegExp(searchText, 'gi') }]
    }

    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }
    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
    // if (req.body.technology) condition = { technology: { $in: [mongoose.Types.ObjectId(req.body.technology)] } }
    // if (req.body.technology) condition.technology "= mongoose.Types.ObjectId(req.body.technology)
    const data = await RoleAndPermission.aggregate([
        { $match: condition },
        // {
        //     $lookup: {
        //         from: 'users',
        //         localField: 'createdById',
        //         foreignField: '_id',
        //         as: 'userData',
        //     },
        // },
        // { $unwind: { path: '$userData', preserveNullAndEmptyArrays: true } },
        // {
        //     $project: {
        //         technology: 1,
        //         firstName: '$userData.firstName',
        //         email: '$userData.email',
        //         empId: '$userData.empId',
        //         designation: '$designationData.title',
        //         department: '$departmentData.title',
        //         description: '$technologyData.description',
        //     },
        // },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await RoleAndPermission.countDocuments({
        ...condition,
        ...child_condition,
    })

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})
exports.rolesAndPermissionDetails = catchAsync(async (req, res, next) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = { _id: mongoose.Types.ObjectId(req.body._id) }

    const data = await RoleAndPermission.aggregate([{ $match: condition }])
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})
exports.changeStatus = toggleStatus(RoleAndPermission)

exports.deleteRole = softDelete(RoleAndPermission)
