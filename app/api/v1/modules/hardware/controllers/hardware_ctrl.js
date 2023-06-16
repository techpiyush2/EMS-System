'use strict'

const catchAsync = require('../../../../../lib/catchAsync'),
    Response = require('../../../../../../app/lib/response'),
    constants = require('../../../../../../app/lib/constants'),
    query = require('../../../../../../app/lib/common_query'),
    toggleStatus = require('./../../factory/changeStatus'),
    { hardwareValidation } = require('./../../../../../lib/joiValidation'),
    softDelete = require('./../../factory/softDelete'),
    mongoose = require('mongoose'),
    Hardware = require('../models/hardware_model'),
    uuid = require('uuid'),
    jwt = require('jsonwebtoken'),
    User = require('../../user/models/user_model'),
    config = require('../../../../../config/config').get(process.env.NODE_ENV)

exports.addHardware = catchAsync(async (req, res) => {
    let insertObj = {
        systemNumber: req.body.systemNumber,
        typeOfSystem: req.body.typeOfSystem,
        brand: req.body.brand,
    }

    // to prevent dublicacy

    const userRes = await Hardware.findOne({
        systemNumber: req.body.systemNumber,
        companyId: req.body.companyId,
    })
    if (userRes) return res.json(Response(constants.statusCode.unauth, constants.messages.exist))
    await hardwareValidation.validateAsync(insertObj)
    const { companyId, createdById, progressBarLength, percentageData, operatingSystem, processor, generation, processorGHZ, ramSize, numOfRam, ssd, cardName, cardSize, externalHardDisk } = req.body

    if (!companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))
    if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))
    insertObj.companyId = companyId
    insertObj.createdById = createdById
    insertObj.progressBarLength = progressBarLength
    insertObj.percentageData = percentageData
    insertObj.operatingSystem = operatingSystem
    insertObj.processor = processor
    insertObj.generation = generation
    insertObj.processorGHZ = processorGHZ
    insertObj.ramSize = ramSize
    insertObj.numOfRam = numOfRam
    insertObj.ssd = ssd
    insertObj.cardName = cardName
    insertObj.cardSize = cardSize
    insertObj.externalHardDisk = externalHardDisk

    const finalResult = await Hardware.create(insertObj)
    const { userId } = req.body

    let updatePercentage = await User.findByIdAndUpdate({ _id: userId }, { isAddHardware: true, percentageData: req.body.percentageData })

    if (!finalResult) return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
    else return res.json(Response(constants.statusCode.ok, constants.messages.addSuccess))
})

exports.hardwareList = catchAsync(async (req, res) => {
    let count = req.body.count ? req.body.count : 10
    req.body.page = req.body.page ? req.body.page : 1
    let skip = count * (req.body.page - 1)

    let sortObject = {}
    if (req.body.sortValue && req.body.sortOrder) {
        sortObject[req.body.sortValue] = req.body.sortOrder
    } else {
        sortObject = { brand: -1 }
    }
    let child_condition = {}
    let condition = {}
    if (req.body.isActive != '' && req.body.isActive != undefined) {
        condition.isActive = req.body.isActive == 'true' ? true : false
    }
    const searchText = decodeURIComponent(req.body.searchText).replace(/[[\]{}()*+?,\\^$|#\s]/g, '\\s+')
    if (req.body.searchText) {
        child_condition.$or = [{ systemNumber: new RegExp(searchText, 'gi') }, { typeOfSystem: new RegExp(searchText, 'gi') }, { brand: new RegExp(searchText, 'gi') }, { operatingSystem: new RegExp(searchText, 'gi') }]
    }

    if (req.body.isDeleted) {
        condition.isDeleted = req.body.isDeleted == 'true' ? true : false
    } else {
        condition.isDeleted = false
    }
    if (req.body.companyId) condition.companyId = mongoose.Types.ObjectId(req.body.companyId)
    if (req.body.createdById) condition.createdById = mongoose.Types.ObjectId(req.body.createdById)
    const data = await Hardware.aggregate([
        { $match: condition },
        {
            $project: {
                systemNumber: '$systemNumber',
                typeOfSystem: '$typeOfSystem',
                brand: '$brand',
                operatingSystem: '$operatingSystem',
                processor: '$processor',
                generation: '$generation',
                processorGHZ: '$processorGHZ',
                ramSize: '$ramSize',
                numOfRam: '$numOfRam',
                ssd: '$ssd',
                cardName: '$cardName',
                cardSize: '$cardSize',
                externalHardDisk: '$externalHardDisk',
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
    const totalCount = await Hardware.countDocuments({
        ...condition,
        ...child_condition,
    })
    if (data.length) return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data, totalCount))
    else return res.json(Response(constants.statusCode.ok, constants.messages.noRecordFound, [], totalCount))
})
exports.hardwareDetails = catchAsync(async (req, res, next) => {
    if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
    let condition = { _id: mongoose.Types.ObjectId(req.body._id) }

    const data = await Hardware.aggregate([
        { $match: condition },
        {
            $project: {
                systemNumber: '$systemNumber',
                typeOfSystem: '$typeOfSystem',
                brand: '$brand',
                operatingSystem: '$operatingSystem',
                processor: '$processor',
                generation: '$generation',
                processorGHZ: '$processorGHZ',
                ramSize: '$ramSize',
                numOfRam: '$numOfRam',
                ssd: '$ssd',
                cardName: '$cardName',
                cardSize: '$cardSize',
                externalHardDisk: '$externalHardDisk',
                companyId: '$companyId',
                createdById: '$createdById',
                isActive: '$isActive',
                isDeleted: '$isDeleted',
            },
        },
    ])
    if (data.length == 0) return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data[0]))
})
exports.hardwareUpdate = catchAsync(async (req, res) => {
    const { _id ,companyId, createdById, progressBarLength, percentageData, operatingSystem, processor, generation, processorGHZ, ramSize, numOfRam, ssd, cardName, cardSize, externalHardDisk } = req.body

    if (!_id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))
      const hardwareData = await Hardware.findById({_id});
      if(!hardwareData){
       return res.json(Response(constants.statusCode.notFound, constants.messages.proiderNotExist))
      }
      if (!companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))
      if (!createdById) return res.json(Response(constants.statusCode.unauth, constants.messages.createdById))
    let insertObj = {
        systemNumber: req.body.systemNumber,
        typeOfSystem: req.body.typeOfSystem,
        brand: req.body.brand,
    }
    insertObj.companyId = companyId
    insertObj.createdById = createdById
    insertObj.progressBarLength = progressBarLength
    insertObj.percentageData = percentageData
    insertObj.operatingSystem = operatingSystem
    insertObj.processor = processor
    insertObj.generation = generation
    insertObj.processorGHZ = processorGHZ
    insertObj.ramSize = ramSize
    insertObj.numOfRam = numOfRam
    insertObj.ssd = ssd
    insertObj.cardName = cardName
    insertObj.cardSize = cardSize
    insertObj.externalHardDisk = externalHardDisk

    const Result = await Hardware.findByIdAndUpdate(_id, insertObj, {
        new: true,
    })
    console.log('Result ', Result)
    if (Result) return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess))
    else return res.json(Response(constants.statusCode.notFound, constants.messages.internalServerError))
})

exports.changeStatus = toggleStatus(Hardware)

exports.delete = softDelete(Hardware)
