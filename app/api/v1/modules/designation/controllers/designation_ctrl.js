const Response = require('../../../../../lib/response'),
    catchAsync = require('./../../../../../lib/catchAsync'),
    toggleDeletedState = require('./../../factory/update'),
    toggleStatus = require('./../../factory/changeStatus'),
    constants = require('./../../../../../lib/constants'),
    query = require('./../../../../../lib/common_query'),
    softDelete = require('./../../factory/softDelete'),
    { designationValidation } = require('./../../../../../lib/joiValidation'),
    Designation = require('./../models/designation_model'),
    mongoose = require('mongoose')
const User = require('../../user/models/user_model')
const Department = require('../../department/models/department_model')

exports.addDesignation = catchAsync(async (req, res, next) => {
    let validateObj = {
        title: req.body.title,
        designationCode: req.body.designationCode,
    }

    const isExistTitle = await Designation.findOne({
        title: req.body.title,
        companyId: req.body.companyId,
        departmentId: req.body.departmentId,
        createdById: req.body.createdById,
    })
    const isExistCode = await Designation.findOne({
        companyId: req.body.companyId,
        departmentId: req.body.departmentId,
        createdById: req.body.createdById,
        designationCode: req.body.designationCode,
    })

    if (isExistCode) return res.json(Response(constants.statusCode.unauth, constants.designationMsg.designationCodeExist))
    if (isExistTitle) return res.json(Response(constants.statusCode.unauth, constants.designationMsg.designationTitle))

    // const userRes = await Designation.findOne({
    //     title: req.body.title,
    //     companyId: req.body.companyId,
    //     departmentId: req.body.departmentId,
    //     createdById: req.body.createdById,
    //     designationCode: req.body.designationCode,
    // })
    // if (userRes) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))
    await designationValidation.validateAsync(validateObj)
    const { createdById, departmentId, progressBarLength, companyId, percentageData } = req.body

    if (!departmentId) return res.json(Response(constants.statusCode.unauth, constants.departmentMsg.departmentIdReq))
    if (!companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))
    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    validateObj.companyId = companyId

    validateObj.createdById = createdById
    validateObj.departmentId = departmentId

    let designationInfo = await Designation.create(validateObj)
    const { userId } = req.body

    let updatePercentage = await User.findByIdAndUpdate({ _id: userId }, { isAddDesignation: true, percentageData: req.body.percentageData })

    if (designationInfo) {
        return res.json(Response(constants.statusCode.ok, constants.designationMsg.addDesignation))
    } else {
        return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    }
})

exports.designationDetails = catchAsync(async (req, res, next) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = { _id: mongoose.Types.ObjectId(req.body._id) }

    const data = await Designation.aggregate([
        { $match: condition },
        {
            $project: {
                designationCode: '$designationCode',
                title: '$title',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                createdById: '$createdById',
                departmentId: '$departmentId',
                companyId: '$companyId',
            },
        },
    ])
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})

exports.designationUpdate = catchAsync(async (req, res) => {
    const { _id, createdById, departmentId } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    let validateObj = {
        title: req.body.title,
        designationCode: req.body.designationCode,
    }

    await designationValidation.validateAsync(validateObj)

    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    if (!departmentId) return res.json(Response(constants.statusCode.unauth, constants.departmentMsg.departmentIdReq))

    validateObj.departmentId = departmentId
    validateObj.createdById = createdById

    const isExist = await Designation.findOne({ designationCode: req.body.designationCode, departmentId: req.body.departmentId })
    const isExistTitle = await Designation.findOne({ title: req.body.title, departmentId: req.body.departmentId })

    console.log('isExistTitle', isExist)

    if (isExist && isExist._id.toString() != _id.toString()) return res.json(Response(constants.statusCode.unauth, constants.designationMsg.alreadyAssociate))
    else if (isExistTitle && isExistTitle._id.toString() != _id.toString()) return res.json(Response(constants.statusCode.unauth, constants.designationMsg.alreadyExistTitle))
    else {
        // const Result = await Designation.findByIdAndUpdate(_id, validateObj, {
        //     new: true,
        // })
        const Result = await Designation.updateOne({ _id: _id }, { title: req.body.title, designationCode: req.body.designationCode })

        if (Result) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
        else return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    }
})

exports.designationList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : constants.settings.count
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
        condition.$or = [{ title: new RegExp(searchText, 'gi') }]
    }

    //used to match the department
    if (req.body.departmentId) condition.departmentId = mongoose.Types.ObjectId(req.body.departmentId)

    if (req.body.createdById) condition.createdById = mongoose.Types.ObjectId(req.body.createdById)
    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)

    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }

    const data = await Designation.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'users',
                let: { designation_Id: '$_id' },
                pipeline: [{ $match: { $expr: { $eq: ['$designation', '$$designation_Id'] } } }],
                as: 'userData',
            },
        },
        {
            $group: {
                _id: '$departmentId',
                designation: {
                    $push: {
                        designationCode: '$designationCode',
                        _id: '$_id',
                        isActive: '$isActive',
                        title: '$title',
                        departmentId: '$departmentId',
                        createdById: '$createdById',
                        userData: { $size: '$userData' },
                    },
                },
            },
        },

        {
            $lookup: {
                from: 'departments',
                let: { dep_id: '$_id' },
                pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$dep_id'] } } }],
                as: 'departmentInfo',
            },
        },
        { $unwind: { path: '$departmentInfo', preserveNullAndEmptyArrays: true } },

        {
            $project: {
                depCode: '$departmentInfo.departmentCode',
                title: '$departmentInfo.title',
                designationArr: '$designation',
            },
        },
        { $match: child_condition },

        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])

    const totalCount = await Designation.countDocuments({
        ...condition,
        ...child_condition,
    })

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})

exports.uniqueDesignationDetails = catchAsync(async (req, res, next) => {
    if (!req.body.departmentId) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    const arr = []

    req.body.departmentId.forEach((el) => (el = arr.push(mongoose.Types.ObjectId(el))))

    const condition = {
        departmentId: { $in: arr },
    }
    const data = await Designation.aggregate([{ $match: condition }])
    const totalCount = await Designation.countDocuments({
        ...condition,
    })
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
})

exports.designationEmpDetails = catchAsync(async (req, res, next) => {
    if (!req.body.createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    const arr = []
    req.body.createdById.forEach((el) => (el = arr.push(mongoose.Types.ObjectId(el))))
    const condition = {
        createdById: { $in: arr },
    }
    const data = await Designation.aggregate([{ $match: condition }])
    const totalCount = await Designation.countDocuments({ ...condition })
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
})

exports.empDesignationList = catchAsync(async (req, res) => {
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

    if (req.body.designation) condition = { designation: { $in: [mongoose.Types.ObjectId(req.body.designation)] } }
    const data = await User.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'departments',
                localField: 'department',
                foreignField: '_id',
                as: 'departmentData',
            },
        },
        { $unwind: { path: '$departmentData', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                firstName: 1,
                email: 1,
                empId: 1,
                departmentName: '$departmentData.title',
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
exports.delete = softDelete(Designation)
exports.changeStatus = toggleStatus(Designation)
