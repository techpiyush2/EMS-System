'use strict'
const constant = require('./constants')
const mongoose = require('mongoose')
const fs = require('fs')
const commonQuery = {}
let SALT_WORK_FACTOR = 10
let bcrypt = require('bcrypt')

const request = require('request')

commonQuery.saltThePassword = function saltThePassword(pwd) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
            if (err) {
                reject({
                    status: false,
                    error: err,
                })
            } else {
                bcrypt.hash(pwd, salt, (err, hash) => {
                    if (err) {
                        reject({
                            status: false,
                            error: err,
                        })
                    } else {
                        resolve({
                            status: true,
                            value: hash,
                        })
                    }
                })
            }
        })
    })
}

commonQuery.addressByLatLng = function addressByLatLng(lat, lng) {
    return new Promise(function (resolve, reject) {
        var options = {
            method: 'GET',
            url: 'https://api.opencagedata.com/geocode/v1/json?q=' + lat + '+' + lng + '&key=fac8868a18d74be6a00b2181eed5af80',
        }
        request(options, function (error, response) {
            if (error) {
                reject(error)
            } else {
                resolve(response.body)
            }
        })
    })
}

commonQuery.findoneData = function findoneData(model, cond, fetchVal) {
    return new Promise(function (resolve, reject) {
        model.findOne(cond, fetchVal, function (err, userData) {
            let tempObj = {
                status: false,
            }
            if (err) {
                tempObj.error = err
                reject(tempObj)
            } else {
                tempObj.status = true
                tempObj.data = userData
                resolve(tempObj)
            }
        })
    })
}

commonQuery.findData = function findData(model, cond, fetchVal, sortBY = '') {
    return new Promise(function (resolve, reject) {
        let tempObj = {
            status: false,
        }
        if (sortBY) {
            var sort_by = sortBY
        } else {
            var sort_by = {
                _id: 'desc',
            }
        }
        model
            .find(cond, fetchVal)
            .sort(sort_by)
            .lean()
            .exec(function (err, userData) {
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userData
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.findDataBySortSkipLimit = function findDataBySortSkipLimit(model, cond, sort_by, count, skip) {
    return new Promise(function (resolve, reject) {
        let tempObj = {
            status: false,
        }
        model
            .find(cond)
            .sort(sort_by)
            .limit(parseInt(count))
            .skip(parseInt(skip))
            .exec(function (err, userData) {
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userData
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.findDataWithPopulate = function findDataWithPopulate(model, cond, populate) {
    return new Promise(function (resolve, reject) {
        let tempObj = {
            status: false,
        }
        model
            .find(cond)
            .populate(populate)
            .exec(function (err, userData) {
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userData
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.findDataWithMultiplePopulate = function findDataWithMultiplePopulate(model, cond, populate1, populate2, populate3) {
    return new Promise(function (resolve, reject) {
        let tempObj = {
            status: false,
        }
        model
            .find(cond)
            .populate(populate1)
            .populate(populate2)
            .populate(populate3)
            .exec(function (err, userData) {
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userData
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.findDataWithPopulateWithCount = function findDataWithPopulateWithCount(model, cond, populate, count) {
    return new Promise(function (resolve, reject) {
        let tempObj = {
            status: false,
        }
        model
            .find(cond)
            .limit(parseInt(count))
            .populate(populate)
            .sort({
                updatedAt: 'descending',
            })
            .exec(function (err, userData) {
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userData
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.findDataWithPopulateWithCountDescending = function findDataWithPopulateWithCountDescending(model, cond, populate, count) {
    return new Promise(function (resolve, reject) {
        let tempObj = {
            status: false,
        }
        model
            .find(cond)
            .limit(parseInt(count))
            .populate(populate)
            .sort({
                createdAt: 'descending',
            })
            .exec(function (err, userData) {
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userData
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.findDataWithPopulateWithCountandPaginateDescending = function findDataWithPopulateWithCountandPaginateDescending(model, cond, populate, populate2, count, skip) {
    return new Promise(function (resolve, reject) {
        let tempObj = {
            status: false,
        }

        model
            .find(cond)
            .limit(parseInt(count))
            .populate(populate)
            .populate(populate2)
            .skip(parseInt(skip))
            .sort({
                createdAt: 'descending',
            })
            .exec(function (err, userData) {
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userData
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.findDataWithCount = function findDataWithCount(model, cond, count) {
    return new Promise(function (resolve, reject) {
        let tempObj = {
            status: false,
        }
        model
            .find(cond)
            .limit(parseInt(count))
            .sort({
                createdAt: 'descending',
            })
            .exec(function (err, userData) {
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userData
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.findoneDataWithPopulate = function findoneDataWithPopulate(model, cond, fetchVal, populate) {
    return new Promise(function (resolve, reject) {
        model
            .findOne(cond, fetchVal)
            .populate(populate)
            .exec(function (err, userData) {
                let tempObj = {
                    status: false,
                }
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userData
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.findoneWithPopulate = function findoneWithPopulate(model, cond, populate) {
    return new Promise(function (resolve, reject) {
        model
            .findOne(cond)
            .populate(populate)
            .exec(function (err, userData) {
                let tempObj = {
                    status: false,
                }
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userData
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.findoneDataWithPopulateInDesc = function findoneDataWithPopulateInDesc(model, cond, populate) {
    return new Promise(function (resolve, reject) {
        let tempObj = {
            status: false,
        }
        model
            .findOne(cond)
            .sort({
                createdAt: 'descending',
            })
            .populate(populate.path)
            .exec(function (err, userData) {
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userData
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.findById = function findById(model, cond) {
    return new Promise(function (resolve, reject) {
        model.findById(cond, function (err, userData) {
            if (err) {
                reject(err)
            } else {
                resolve(userData)
            }
        })
    })
}

commonQuery.updatedById = function updatedById(model) {
    return new Promise(function (resolve, reject) {
        model.save(function (err, userData) {
            if (err) {
                reject(err)
            } else {
                resolve(userData)
            }
        })
    })
}

commonQuery.lastInsertedId = function lastInsertedId(model) {
    return new Promise(function (resolve, reject) {
        model
            .findOne()
            .sort({
                id: -1,
            })
            .exec(function (err, data) {
                if (err) {
                    resolve(0)
                } else {
                    if (data) {
                        var id = data.id + 1
                    } else {
                        var id = 1
                    }
                }
                resolve(id)
            })
    })
}

commonQuery.InsertIntoCollection = function InsertIntoCollection(model, obj) {
    return new Promise(function (resolve, reject) {
        new model(obj).save(function (err, userInfo) {
            let tempObj = {
                status: false,
            }
            if (err) {
                tempObj.error = err
                reject(tempObj)
            } else {
                tempObj.status = true
                tempObj.data = userInfo
                resolve(tempObj)
            }
        })
    })
}

commonQuery.InsertManyIntoCollection = function InsertManyIntoCollection(model, arr) {
    return new Promise(function (resolve, reject) {
        try {
            model.insertMany(arr, function (err, userInfo) {
                let tempObj = {
                    status: false,
                }
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userInfo
                    resolve(tempObj)
                }
            })
        } catch (error) {
            console.log(' on insert many ::userInfo::>', error)
        }
    })
}

commonQuery.fileUpload = function fileUpload(imagePath, buffer) {
    return new Promise((resolve, reject) => {
        try {
            let tempObj = {
                status: false,
            }
            fs.writeFile(imagePath, buffer, function (err) {
                if (err) {
                    tempObj.error = err
                    reject(err)
                } else {
                    tempObj.status = true
                    tempObj.message = 'uploaded'
                    resolve(tempObj)
                }
            })
        } catch (e) {
            reject(e)
        }
    })
}

commonQuery.FileExist = function FileExist(imagePath, noImage, imageloc) {
    return new Promise(function (resolve, reject) {
        utility.fileExistCheck(imagePath, function (exist) {
            if (!exist) {
                resolve(constant.config.baseUrl + noImage)
            } else {
                resolve(constant.config.baseUrl + imageloc)
            }
        })
    })
}

commonQuery.deleteFile = function deleteFile(filePath) {
    return new Promise(function (resolve, reject) {
        fs.unlink(filePath, function (err) {
            if (err) {
                reject(err)
            } else {
                resolve('success')
            }
        })
    })
}
commonQuery.getTeamMembers = function getTeamMembers(model, condition, fetchVal, sortby) {
    return new Promise(function (resolve, reject) {
        if (!sortby) {
            sortby = { _id: -1 }
        }
        model
            .find(condition, fetchVal)
            .sort(sortby)
            .exec(function (err, data) {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })
    })
}
commonQuery.updateOneDocument = function updateOneDocument(model, updateCond, userUpdateData) {
    return new Promise(function (resolve, reject) {
        model
            .findOneAndUpdate(
                updateCond,
                {
                    $set: userUpdateData,
                },
                {
                    new: true,
                }
            )
            .lean()
            .exec(function (err, userInfoData) {
                let tempObj = {
                    status: false,
                }
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userInfoData
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.pushObjIntoDocument = function pushObjIntoDocument(model, updateCond, userUpdateData, setCondition = {}) {
    return new Promise(function (resolve, reject) {
        model
            .findOneAndUpdate(updateCond, {
                $push: userUpdateData,
                $set: setCondition,
            })
            .lean()
            .exec(function (err, userInfoData) {
                let tempObj = {
                    status: false,
                }
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userInfoData
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.pullObjFromDocument = function pullObjFromDocument(model, updateCond, userUpdateData) {
    return new Promise(function (resolve, reject) {
        model
            .findOneAndUpdate(updateCond, {
                $pull: userUpdateData,
            })
            .lean()
            .exec(function (err, userInfoData) {
                let tempObj = {
                    status: false,
                }
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userInfoData
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.updateDocumentwithArrayField = function updateDocumentwithArrayField(model, updateCond, userUpdateData) {
    return new Promise(function (resolve, reject) {
        model
            .findOneAndUpdate(updateCond, userUpdateData)
            .lean()
            .exec(function (err, userInfoData) {
                let tempObj = {
                    status: false,
                }
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userInfoData
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.updateAllDocument = function updateAllDocument(model, updateCond, userUpdateData) {
    return new Promise(function (resolve, reject) {
        let tempObj = {
            status: false,
        }
        model
            .update(
                updateCond,
                {
                    $set: userUpdateData,
                },
                {
                    multi: true,
                }
            )
            .lean()
            .exec(function (err, userInfoData) {
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userInfoData
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.updateMultipleDocument = function updateMultipleDocument(model, updateCond, userUpdateData) {
    return new Promise(function (resolve, reject) {
        let tempObj = {
            status: false,
        }
        model
            .bulkWrite(
                userUpdateData.map((obj) => {
                    let updateObj = obj
                    let filterId = obj._id
                    delete updateObj._id //delete _id from update object
                    return {
                        updateOne: {
                            filter: {
                                _id: filterId,
                            },
                            update: {
                                $set: updateObj,
                            },
                            upsert: true,
                        },
                    }
                })
            )
            .then((userInfoData) => {
                tempObj.status = true
                tempObj.data = userInfoData
                resolve(tempObj)
            })
            .catch((err) => {
                tempObj.error = err
                reject(tempObj)
            })
    })
}

commonQuery.fetch_all = function fetch_all(model, cond, fetchd) {
    return new Promise(function (resolve, reject) {
        model.find(cond, fetchd).exec(function (err, userData) {
            if (err) {
                reject(err)
            } else {
                resolve(userData)
            }
        })
    })
}

commonQuery.countData = function countData(model, cond) {
    let tempObj = {
        status: false,
    }
    return new Promise(function (resolve, reject) {
        model.count(cond).exec(function (err, userData) {
            if (err) {
                tempObj.error = err
                reject(tempObj)
            } else {
                tempObj.status = true
                tempObj.data = userData
                resolve(tempObj)
            }
        })
    })
}

commonQuery.fetchAllLimit = function fetchAllLimit(query) {
    return new Promise(function (resolve, reject) {
        query.exec(function (err, userData) {
            if (err) {
                reject(err)
            } else {
                resolve(userData)
            }
        })
    })
}

commonQuery.uniqueInsertIntoCollection = function uniqueInsertIntoCollection(model, obj) {
    let result = {
        status: false,
    }
    return new Promise(function (resolve, reject) {
        new model(obj).save(function (err, userData) {
            if (err) {
                console.log('\n uniqueInsertIntoCollection error \n', err)
                result.status = false
                result.err = err
                reject(result)
            } else {
                result.status = true
                result.userData = userData
                resolve(result)
            }
        })
    })
}

commonQuery.deleteOneDocument = function deleteOneDocument(model, cond) {
    let result = {
        status: false,
    }

    return new Promise(function (resolve, reject) {
        model.deleteOne(cond).exec(function (err, userData) {
            if (err) {
                result.err = err
                reject(result)
            } else {
                result.status = true
                result.userData = userData
                resolve(result)
            }
        })
    })
}

commonQuery.deleteManyfromCollection = function deleteManyfromCollection(model, obj) {
    return new Promise(function (resolve, reject) {
        model.deleteMany(obj, function (error, inserted) {
            if (error) {
                resolve(0)
            } else {
                resolve(1)
            }
        })
    })
}

commonQuery.findAvailabilityDataBySort = function findAvailabilityDataBySort(model, cond) {
    return new Promise(function (resolve, reject) {
        let tempObj = {
            status: false,
        }
        model
            .find(cond)
            .sort({
                startDate: 1,
            })
            .exec(function (err, userData) {
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userData
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.findAvailabilityDataBySortDescending = function findAvailabilityDataBySortDescending(model, cond) {
    return new Promise(function (resolve, reject) {
        let tempObj = {
            status: false,
        }
        model
            .find(cond)
            .sort({
                endDate: -1,
            })
            .exec(function (err, userData) {
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = userData
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.dateToStringData = function dateToStringData(model, condi) {
    return new Promise((resolve, reject) => {
        model.aggregate(condi).exec(function (err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

commonQuery.doAggregate = function doAggregate(model, condArr) {
    return new Promise((resolve, reject) => {
        model.aggregate(condArr).exec(function (err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

commonQuery.findoneBySort = function findoneBySort(model, condition, fetchVal, sortby) {
    return new Promise(function (resolve, reject) {
        if (!sortby) {
            sortby = {
                _id: -1,
            }
        }
        model
            .findOne(condition, fetchVal)
            .sort(sortby)
            .exec(function (err, data) {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })
    })
}

commonQuery.countStaffData = function countStaffData(model, cond) {
    return new Promise(function (resolve, reject) {
        model.countDocuments(cond).exec(function (err, userData) {
            if (err) {
                reject(err)
            } else {
                resolve(userData)
            }
        })
    })
}

commonQuery.FindOne = function FindOne(model, cond = {}, projection = {}) {
    return new Promise((resolve, reject) => {
        try {
            if (!model || !Object.keys(cond).length)
                return reject({
                    statusCode: 400,
                    message: !model ? 'table' : 'condition to find',
                })
            model.findOne(cond, projection).exec(function (err, data) {
                if (err) {
                    // console.log(err)
                    return reject(err)
                } else {
                    // console.log(data);
                    return resolve(data)
                }
            })
        } catch (error) {
            return reject({
                statusCode: 500,
                message: 'Internal server error',
            })
        }
    })
}

commonQuery.mongoObjectId = function (data) {
    if (data && data !== null && data !== undefined) {
        return mongoose.Types.ObjectId(data)
    } else {
        return false
    }
}

commonQuery.bytesToSize = function (bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes == 0) return '0 Byte'
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}

commonQuery.getValidationErrors = function (validationErrors) {
    let errorMsgList = []
    try {
        let splitAtColon = validationErrors.message.split(':')
        splitAtColon.splice(0, 1)
        errorMsgList = splitAtColon.toString().split(',')
        for (let i = 0; i < errorMsgList.length; i++) {
            errorMsgList.splice(i, 1)
        }
    } catch (e) {
        errorMsgList = []
    }

    return errorMsgList
}

commonQuery.emit = function (name, obj) {
    console.log('socketObj', obj)
    if (obj && obj.receiver && Array.isArray(obj.receiver)) {
        let rec = obj.receiver
        rec.forEach((id) => {
            let touser = socketClientList[id]

            _socketio.to(touser).emit(name, obj)
        })
    }
}

commonQuery.isValidMongoObjectId = function (data) {
    try {
        if (data && !_.isNil(data) && !_.isEmpty(data)) {
            return mongoose.Types.ObjectId.isValid(data)
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}

commonQuery.upsertDocument = function upsertDocument(model, findCondition, userUpsertData) {
    return new Promise(function (resolve, reject) {
        model
            .findOneAndUpdate(
                findCondition,
                {
                    $set: userUpsertData,
                },
                {
                    upsert: true,
                    new: true,
                }
            )
            .lean()
            .exec(function (err, updateInfo) {
                let tempObj = {
                    status: false,
                }
                if (err) {
                    tempObj.error = err
                    reject(tempObj)
                } else {
                    tempObj.status = true
                    tempObj.data = updateInfo
                    resolve(tempObj)
                }
            })
    })
}

commonQuery.stripePayment = function stripePayment(objData) {
    return stripe.charges
        .create({
            amount: objData.planData.monthlyCost * 100,
            description: '',
            currency: 'USD',
            source: objData.tokenId,
            metadata: { email: objData.email, name: objData.name },
        })
        .then((charge) => {
            return { status: true, charge: charge }
        })
        .catch((err) => {
            return { status: false, type: err.type, message: err.message }
        })
}

module.exports = commonQuery
