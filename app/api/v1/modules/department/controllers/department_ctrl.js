const Response = require('../../../../../lib/response'),
    catchAsync = require('./../../../../../lib/catchAsync'),
    toggleDeletedState = require('./../../factory/update'),
    toggleStatus = require('./../../factory/changeStatus'),
    constants = require('./../../../../../lib/constants'),
    query = require('./../../../../../lib/common_query'),
    softDelete = require('./../../factory/softDelete'),
    { departmentValidation } = require('./../../../../../lib/joiValidation'),
    Department = require('./../models/department_model'),
    mongoose = require('mongoose')
const User = require('../../user/models/user_model')

exports.addDepartment = catchAsync(async (req, res, next) => {
    const isExistTitle = await Department.findOne({
        title: req.body.title,
        companyId: req.body.companyId,
        createdById: req.body.createdById,
    })
    const isExistCode = await Department.findOne({
        departmentCode: req.body.departmentCode,
        companyId: req.body.companyId,
        createdById: req.body.createdById,
    })

    if (isExistCode) return res.json(Response(constants.statusCode.unauth, constants.departmentMsg.departmentCode))
    if (isExistTitle) return res.json(Response(constants.statusCode.unauth, constants.departmentMsg.departmentTitle))

    let validateObj = {
        title: req.body.title,
        departmentCode: req.body.departmentCode,
    }
    await departmentValidation.validateAsync(validateObj)

    const { createdById, progressBarLength, percentageData, companyId } = req.body

    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))
    if (!companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))
    validateObj.companyId = companyId
    validateObj.createdById = createdById
    let departmentInfo = await Department.create(validateObj)

    const { userId } = req.body

    let updatePercentage = await User.findByIdAndUpdate({ _id: userId }, { isAddDepartment: true, percentageData: req.body.percentageData })
    console.log('updatePercentage=========', updatePercentage)
    if (departmentInfo || updatePercentage) {
        return res.json(Response(constants.statusCode.ok, constants.departmentMsg.addDepartment))
    } else {
        return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
    }
})
exports.departmentDetails = catchAsync(async (req, res, next) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = { _id: mongoose.Types.ObjectId(req.body._id) }

    const data = await Department.aggregate([
        { $match: condition },
        {
            $project: {
                departmentCode: '$departmentCode',
                title: '$title',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                createdById: '$createdById',
                companyId: '$companyId',
                progressBarLength: 1,
                percentageData: 1,
                isAddDepartment: 1,
            },
        },
    ])
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})
exports.departmentUpdate = catchAsync(async (req, res) => {
    const { _id, title, departmentCode } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    let validateObj = { title: title, departmentCode: departmentCode }
    await departmentValidation.validateAsync(validateObj)
    const isExist = await Department.findOne({ $or: [{ title: title }, { departmentCode: departmentCode }] })
    // const isExistCode = await Department.findOne({ departmentCode: departmentCode })

    console.log('isExistTitle', isExist)

    // return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))

    if (isExist && isExist.title == title && isExist._id != _id) return res.json(Response(constants.statusCode.unauth, constants.departmentMsg.departmentTitle))
    if (isExist && isExist.departmentCode == departmentCode && isExist._id != _id) return res.json(Response(constants.statusCode.unauth, constants.departmentMsg.departmentCode))

    const Result = await Department.findByIdAndUpdate(_id, validateObj, { new: true })
    if (Result) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
})
exports.departmentList = catchAsync(async (req, res) => {
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

    if (req.body.createdById) condition.createdById = mongoose.Types.ObjectId(req.body.createdById)
    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)

    const data = await Department.aggregate([
        { $match: condition },

        {
            $lookup: {
                from: 'users',
                localField: 'createdById',
                foreignField: '_id',
                as: 'userData',
            },
        },

        {
            $project: {
                percentageData: '$userData.percentageData',
                departmentCode: '$departmentCode',
                title: '$title',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                createdById: '$createdById',
                companyId: '$companyId',
                totalUser: '$totalUser',
                progressBarLength: '$progressBarLength',
                percentageData: 1,
                isAddDepartment: 1,
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await Department.countDocuments({
        ...condition,
        ...child_condition,
    })
    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})
exports.empDepartmentCount = catchAsync(async (req, res) => {
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
        child_condition.$or = [{ title: new RegExp(searchText, 'gi') }]
    }

    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }

    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)

    const data = await Department.aggregate([
        { $match: condition },

        {
            $lookup: {
                from: 'users',
                let: { departmentId: '$_id' },
                pipeline: [{ $match: { $expr: { $eq: ['$department', '$$departmentId'] } } }],
                as: 'userData',
            },
        },

        {
            $project: {
                departmentCode: 1,
                title: 1,
                isActive: 1,
                createdById: 1,
                companyId: 1,
                userData: { $size: '$userData' },
                isDeleted: 1,
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await Department.countDocuments({
        ...condition,
        ...child_condition,
    })
    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})
exports.empDepartmentList = catchAsync(async (req, res) => {
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

    if (req.body.department) condition = { department: { $in: [mongoose.Types.ObjectId(req.body.department)] } }
    const data = await User.aggregate([
        { $match: condition },
        {
            $project: {
                firstName: 1,
                email: 1,
                empId: 1,
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
exports.delete = softDelete(Department)
exports.changeStatus = toggleStatus(Department)
