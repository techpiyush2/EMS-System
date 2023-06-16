const Response = require('../../../../../lib/response'),
    catchAsync = require('../../../../../lib/catchAsync'),
    toggleDeletedState = require('../../factory/update'),
    toggleStatus = require('../../factory/changeStatus'),
    constants = require('../../../../../lib/constants'),
    softDelete = require('../../factory/softDelete'),
    { projectValidation } = require('../../../../../lib/joiValidation'),
    { teamValidation } = require('../../../../../lib/joiValidation'),
    mailer = require('../../../../../lib/mailer'),
    Project = require('../models/project_model'),
    shortid = require('shortid'),
    mongoose = require('mongoose'),
    TeamModel = require('../models/team_model'),
    User = require('../../user/models/user_model')
const moment = require('moment')

exports.addProject = catchAsync(async (req, res, next) => {
    let validateObj = {
        name: req.body.name,
        description: req.body.description,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        projectManagerId: req.body.projectManagerId,
        projectLocation: req.body.projectLocation,
        clientName: req.body.clientName,
        corporateAddress: req.body.corporateAddress,
        clientEmail: req.body.clientEmail,
        clientPhoneNo: req.body.clientPhoneNo,
        clientCode: req.body.clientCode,
        domainId: req.body.domainId,
    }

    const projectRes = await Project.findOne({
        name: req.body.name,
    })
    if (projectRes) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))
    await projectValidation.validateAsync(validateObj)

    const { createdById, companyId, technologyId, duration, socialMediaId } = req.body

    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))

    if (!companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))

    validateObj.createdById = createdById
    validateObj.companyId = companyId
    validateObj.technologyId = technologyId
    validateObj.duration = duration
    validateObj.socialMediaId = socialMediaId

    let randomNumber = Math.floor(1000 + Math.random() * 9000)
    validateObj.code = req.body.name.substring(0, 3) + randomNumber
    let project = await Project.create(validateObj)

    if (project) {
        return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess, project._id))
    } else {
        return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    }
})
exports.empProjectList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 100
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

    if (req.body.isDeleted) {
        child_condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        child_condition.isDeleted = false
    }
    if (req.body.createdById) condition.companyId = mongoose.Types.ObjectId(req.body.createdById)

    if (req.body.employeeId) {
        condition.employeeId = mongoose.Types.ObjectId(req.body.employeeId)
        condition.inTeam = true
    }

    const data = await TeamModel.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'projects',
                localField: 'projectId',
                foreignField: '_id',
                as: 'proData',
            },
        },
        { $unwind: { path: '$proData', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                name: '$proData.name',
                _id: '$proData._id',
                isDeleted: '$proData.isDeleted',
                endDate: 1,
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await TeamModel.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'projects',
                localField: 'projectId',
                foreignField: '_id',
                as: 'proData',
            },
        },
        { $unwind: { path: '$proData', preserveNullAndEmptyArrays: true } },

        {
            $project: {
                name: '$proData.name',
                _id: '$proData._id',
                isDeleted: '$proData.isDeleted',
            },
        },
        { $match: child_condition },
    ])

    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount.length))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount.length))
})

exports.projectList = catchAsync(async (req, res) => {
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

    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }
    if (req.body.createdById) condition.createdById = mongoose.Types.ObjectId(req.body.createdById)
    if (req.body.projectLocation) condition.projectLocation = mongoose.Types.ObjectId(req.body.projectLocation)

    const data = await Project.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'users',
                localField: 'projectManagerId',
                foreignField: '_id',
                as: 'userData',
            },
        },
        { $unwind: { path: '$userData', preserveNullAndEmptyArrays: true } },

        {
            $project: {
                name: '$name',
                code: '$code',
                ProjectManagerId: '$userData.firstName',
                technologyId: '$technologyId',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
                companyId: '$companyId',
                createdById: '$createdById',
                projectLocation: 1,
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])
    const totalCount = await Project.countDocuments({
        ...condition,
        ...child_condition,
    })
    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})
exports.projectDetails = catchAsync(async (req, res, next) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = { _id: mongoose.Types.ObjectId(req.body._id) }

    const data = await Project.aggregate([
        { $match: condition },

        {
            $project: {
                name: '$name',
                code: '$code',
                description: '$description',
                startDate: '$startDate',
                endDate: '$endDate',
                domainId: '$domainId',
                projectManagerId: '$projectManagerId',
                projectLocation: '$projectLocation',
                clientName: '$clientName',
                clientCode: '$clientCode',
                socialMediaId: '$socialMediaId',
                technologyId: '$technologyId',
                corporateAddress: '$corporateAddress',
                clientEmail: '$clientEmail',
                clientPhoneNo: '$clientPhoneNo',
            },
        },
    ])
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})
exports.projectUpdate = catchAsync(async (req, res) => {
    const { _id } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

    let validateObj = {
        name: req.body.name,
        description: req.body.description,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        domainId: req.body.domainId,
        projectManagerId: req.body.projectManagerId,
        projectLocation: req.body.projectLocation,
        clientName: req.body.clientName,
        corporateAddress: req.body.corporateAddress,
        clientEmail: req.body.clientEmail,
        clientPhoneNo: req.body.clientPhoneNo,
        clientCode: req.body.clientCode,
    }

    await projectValidation.validateAsync(validateObj)

    const { technologyId, socialMediaId } = req.body

    validateObj.technologyId = technologyId
    validateObj.socialMediaId = socialMediaId

    const Result = await Project.findByIdAndUpdate(_id, validateObj, {
        new: true,
    })

    if (Result) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
})

//assign team to project
exports.createTeam = catchAsync(async (req, res) => {
    req.body.startDate = moment(new Date(req.body.startDate)).format('YYYY-MM-DD')
    req.body.endDate = moment(new Date(req.body.endDate)).format('YYYY-MM-DD')

    console.log('req.body', req.body)

    let insertObj = {
        employeeId: req.body.employeeId,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        projectId: req.body.projectId,
        companyId: req.body.companyId,
    }

    let isExist = await TeamModel.findOne({ companyId: mongoose.Types.ObjectId(req.body.companyId), employeeId: mongoose.Types.ObjectId(req.body.employeeId), projectId: mongoose.Types.ObjectId(req.body.projectId) }, { startDate: 1, endDate: 1, inTeam: 1 })

    console.log('isExist', isExist)

    if (isExist) {
        console.log('enter into isExist')

        let updateData = await TeamModel.findByIdAndUpdate({ _id: isExist._id }, { inTeam: !isExist.inTeam, startDate: !isExist.inTeam ? req.body.startDate : new Date(), endDate: !isExist.inTeam ? req.body.endDate : new Date() }, { new: true })
        // let updateData = await TeamModel.findByIdAndUpdate({ _id: isExist._id }, { inTeam: !isExist.inTeam, endDate: new Date() }, { new: true })

        if (updateData) {
            return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
        }
    }
    console.log(insertObj, '===============')
    // return false

    await teamValidation.validateAsync(insertObj)
    console.log('updateData')

    let team = await TeamModel.create(insertObj)
    console.log(team, 'team==============v')
    if (team) {
        return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
    } else {
        return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
    }
})

//project team list
exports.teamList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 10
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)

    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { inTeam: -1 }
    }
    let child_condition = {}
    let condition = {}
    if (req.body.isActive != '' && req.body.isActive != undefined) {
        condition.isActive = req.body.isActive == 'true' ? true : false
    }
    const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')
    if (req.body.searchText) {
        child_condition.$or = [{ firstName: new RegExp(searchText, 'gi') }, { lastName: new RegExp(searchText, 'gi') }]
    }

    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }

    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
    if (req.body.branchId) condition.branchId = mongoose.Types.ObjectId(req.body.branchId)

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
        { $unwind: { path: '$designationData', preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: 'teams',
                let: { employeeId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [{ $eq: ['$employeeId', '$$employeeId'] }, { $eq: ['$projectId', mongoose.Types.ObjectId(req.body.projectId)] }, { $eq: ['$inTeam', true] }],
                            },
                        },
                    },
                ],
                as: 'proData',
            },
        },

        {
            $lookup: {
                from: 'domains',
                localField: 'domainId',
                foreignField: '_id',
                as: 'domainData',
            },
        },
        { $unwind: { path: '$domainData', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                firstName: '$firstName',
                empId: '$empId',
                designation: '$designationData.title',
                domain: '$domainData',
                startDate: '$proData.startDate',
                endDate: '$proData.endDate',
                branchId: '$branchId',
                inTeam: { $cond: { if: { $eq: [{ $size: '$proData' }, 1] }, then: true, else: false } },
            },
        },
        { $match: child_condition },
        { $sort: sortObject },
        { $limit: parseInt(skip) + parseInt(count) },
        { $skip: parseInt(skip) },
    ])

    const totalCount = await User.aggregate([
        { $match: condition },
        {
            $lookup: {
                from: 'designations',
                localField: 'designation',
                foreignField: '_id',
                as: 'designationData',
            },
        },
        { $unwind: { path: '$designationData', preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: 'teams',
                let: { employeeId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [{ $eq: ['$employeeId', '$$employeeId'] }, { $eq: ['$projectId', mongoose.Types.ObjectId(req.body.projectId)] }, { $eq: ['$inTeam', true] }],
                            },
                        },
                    },
                ],
                as: 'proData',
            },
        },

        {
            $lookup: {
                from: 'domains',
                localField: 'domainId',
                foreignField: '_id',
                as: 'domainData',
            },
        },
        { $unwind: { path: '$domainData', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                firstName: '$firstName',
                empId: '$empId',
                designation: '$designationData.title',
                domain: '$domainData',
                inTeam: { $cond: { if: { $eq: [{ $size: '$proData' }, 1] }, then: true, else: false } },
            },
        },
        { $match: child_condition },
    ])
    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount.length))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount.length))
})

exports.Delete = softDelete(Project)
exports.changeStatus = toggleStatus(Project)
