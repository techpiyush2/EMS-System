const Response = require('./response'),
    constants = require('./constants'),
    query = require('./common_query'),
    uuid = require('uuid'),
    utility = require('./utility'),
    fs = require('fs'),
    catchAsync = require('./catchAsync'),
    sharp = require('sharp'),
    Role = require('./../api/v1/modules/role/models/role_model'),
    LeaveApply = require('./../api/v1/modules/leaveApply/models/leaveApply_model')
const sizeOf = require('image-size')
const request = require('request')
const { convertCSVToArray } = require('convert-csv-to-array')
const config = require('../../app/config/config').get(process.env.NODE_ENV)

exports.changePswdCredential = (req, res, next) => {
    if (Object.keys(req.body).length === 0 && req.body.constructor === Object) return res.json(Response(constants.statusCode.unauth, constants.messages.requiredFieldsMissing))

    const { id, oldPassword, newPassword, confirmPassword } = req.body

    if (!id) return res.json(Response(constants.statusCode.unauth, constants.messages.userIdRequired))
    if (!oldPassword) return res.json(Response(constants.statusCode.unauth, constants.messages.oldPswdReq))
    if (!newPassword) return res.json(Response(constants.statusCode.unauth, constants.messages.newPswdReq))
    if (!confirmPassword) return res.json(Response(constants.statusCode.unauth, constants.messages.confirmPswdReq))
    if (newPassword !== confirmPassword) return res.json(Response(constants.statusCode.unauth, constants.messages.confirmPswdNotMatch))
    if (newPassword === oldPassword) return res.json(Response(constants.statusCode.unauth, constants.messages.newAndoldPwdNotSame))

    next()
}

exports.resetPswdCredential = (req, res, next) => {
    if (Object.keys(req.body).length === 0 && req.body.constructor === Object) return res.json(Response(constants.statusCode.unauth, constants.messages.requiredFieldsMissing))

    const { token, newPassword, confirmPassword } = req.body

    if (!token) return res.json(Response(constants.statusCode.unauth, constants.messages.token))

    if (!newPassword) return res.json(Response(constants.statusCode.unauth, constants.messages.newPswdReq))
    if (!confirmPassword) return res.json(Response(constants.statusCode.unauth, constants.messages.confirmPswdReq))
    if (newPassword !== confirmPassword) return res.json(Response(constants.statusCode.unauth, constants.messages.confirmPswdNotMatch))

    next()
}
exports.leaveApplyMiddleware = catchAsync(async (req, res, next) => {
    if (!req.body.companyId) return res.json(Response(constants.statusCode.unauth, constants.messages.companyId))
    if (!req.body.branchId) return res.json(Response(constants.statusCode.unauth, constants.messages.branchId))
    if (!req.body.leaveType) return res.json(Response(constants.statusCode.unauth, constants.leaveMsg.type))
    let condition = { companyId: mongoose.Types.ObjectId(req.body.companyId), branchId: mongoose.Types.ObjectId(req.body.branchId), leaveType: mongoose.Types.ObjectId(req.body.leaveType) }
    console.log('condition', condition)
    const data = await LeaveApply.findOne(condition)
    console.log('data============', data)
    if (!data) return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
    else return res.json(Response(constants.statusCode.ok, constants.messages.ExecutedSuccessfully, data))
})
exports.getRoleId = (req, res, next) => {
    async function roleId() {
        try {
            if (!req.body.roleTitle) return res.json(Response(constants.statusCode.unauth, constants.roleMsg.titleReq))

            const { roleTitle } = req.body

            const isExist = (await query.findoneData(Role, { roleTitle }, { _id: 1, isActive: 1, isDeleted: 1 })).data

            if (!isExist) return res.json(Response(constants.statusCode.alreadyExist, constants.roleMsg.notExist))

            req.body.roleId = isExist._id
            next()
        } catch (error) {
            return res.json(Response(constants.statusCode.internalservererror, constants.messages.internalError + ' ' + error))
        }
    }
    roleId().then(function () {})
}

exports.resizeImages = async (req, res, next) => {
    let tempArray = []
    let tempObj = []
    tempArray.push(req.files.files)

    tempArray.forEach((element) => {
        if (element.length) {
            tempObj = element
        } else {
            tempObj.push(element)
        }
    })
    const totalLength = tempObj.length

    if (!req.files) {
        return res.json(Response(constants.statusCode.unauth, constants.messages.uploadImageReq))
    }
    const randomStr = uuid.v4(),
        currentDate = Date.now(),
        randomName = randomStr + '-' + currentDate

    var images = []
    let sizeFlag = false
    var counter = 0
    await Promise.all(
        tempObj.map(async (file) => {
            const size = file.size,
                imageBuffer = file.data,
                mimetype = file.mimetype,
                imgOriginalName = file.name
            if (mimetype == 'image/png' || mimetype == 'image/jpeg') {
                const UPLOADIMAGE = constants.directoryPath.PRODUCTIMAGE
                const db_path = randomName + '_' + imgOriginalName
                const uploadLocation = UPLOADIMAGE + randomName + '_' + imgOriginalName
                images.push(db_path)
                await fs.writeFile(uploadLocation, imageBuffer, function (imgerr) {
                    counter++
                    if (!imgerr) {
                        fs.readFile(uploadLocation, async function (err, data) {
                            console.log('err ', err)
                            if (err) {
                                return res.json(Response(constants.statusCode.unauth, err))
                            }
                            const thumbpath = UPLOADIMAGE + 'thumbnail_800X500/' + randomName + '_' + imgOriginalName
                            const thumbpath1 = UPLOADIMAGE + 'thumbnail_1100X685/' + randomName + '_' + imgOriginalName
                            const thumbpath2 = UPLOADIMAGE + 'thumbnail_245X245/' + randomName + '_' + imgOriginalName
                            const thumbpath3 = UPLOADIMAGE + 'thumbnail_150X120/' + randomName + '_' + imgOriginalName

                            await sharp(imageBuffer).resize(800, 500).toFile(thumbpath)
                            await sharp(imageBuffer).resize(1100, 685).toFile(thumbpath1)
                            await sharp(imageBuffer).resize(245, 245).toFile(thumbpath2)
                            await sharp(imageBuffer).resize(150, 120).toFile(thumbpath3)
                        })
                        console.log(counter + '==' + totalLength)
                        if (counter === totalLength) {
                            return res.json(Response(constants.statusCode.ok, constants.messages.image_upl, images))
                        }
                    }
                })
            } else {
                return res.json(Response(constants.statusCode.unauth, constants.messages.invalidImageFormat))
            }
        })
    )
}

exports.deleteProductImage = catchAsync(async (req, res) => {
    let filePath = req.body.filePath
    let file = req.body.file

    await fs.unlink(filePath + file, async function (err) {
        if (err) {
            return res.json(Response(constants.statusCode.internalServerError, constants.validateMsg.internalError, err))
        } else {
            fs.unlink(`${filePath}./thumbnail_150X120/${file}`, (err) => {
                if (err) throw err
                console.log(`${file}.csv was deleted`)
            })
            fs.unlink(`${filePath}./thumbnail_245X245/${file}`, (err) => {
                if (err) throw err
                console.log(`${file}.csv was deleted`)
            })
            fs.unlink(`${filePath}./thumbnail_800X500/${file}`, (err) => {
                if (err) throw err
                console.log(`${file}.csv was deleted`)
            })
            fs.unlink(`${filePath}./thumbnail_1100X685/${file}`, (err) => {
                if (err) throw err
                console.log(`${file}.csv was deleted`)
            })
            setTimeout(() => {
                return res.json(Response(constants.statusCode.ok, constants.messages.IMG_DELETED, ''))
            }, 1000)
        }
    })
})

// IMAGE UPLOAD
exports.uploadImage = (req, res) => {
    if (!req.body.type) return res.json(Response(constants.statusCode.unauth, constants.messages.uploadTypeReq))

    let UPLOADIMAGE

    switch (req.body.type) {
        case 'COMPANY':
            UPLOADIMAGE = constants.directoryPath.COMPANY
            break

        case 'USER':
            UPLOADIMAGE = constants.directoryPath.USER
            break

        case 'EMPLOYEE':
            UPLOADIMAGE = constants.directoryPath.EMPLOYEE
            break

        case 'SUPER_ADMIN':
            UPLOADIMAGE = constants.directoryPath.SUPER_ADMIN
            break
    }

    const randomStr = uuid.v4(),
        currentDate = Date.now(),
        randomName = randomStr + '-' + currentDate

    const size = req.files.file.size,
        imageBuffer = req.files.file.data,
        mimetype = req.files.file.mimetype,
        imgOriginalName = req.files.file.name

    // size should be less then 5mb
    if (size >= 5000000) return res.json(Response(constants.statusCode.unauth, constants.messages.sizeExceeded))

    if (mimetype == 'image/png' || mimetype == 'image/jpeg') {
        const db_path = randomName + '_' + imgOriginalName
        const uploadLocation = UPLOADIMAGE + randomName + '_' + imgOriginalName

        fs.writeFile(uploadLocation, imageBuffer, function (imgerr) {
            if (imgerr) {
                return res.json(Response(constants.statusCode.unauth, constants.messages.internalServerError, imgerr))
            }

            fs.readFile(uploadLocation, function (err, data) {
                if (err) {
                    return res.json(Response(constants.statusCode.unauth, err))
                }

                const thumbpath = UPLOADIMAGE + 'thumbnail/' + randomName + '_' + imgOriginalName

                sharp(imageBuffer)
                    .resize(348, 280)
                    .toFile(thumbpath, (err, info) => {
                        if (!err) {
                            return res.json(
                                Response(constants.statusCode.ok, constants.messages.uploadSuccess, {
                                    Path: uploadLocation,
                                    imagePath: db_path,
                                })
                            )
                        }
                        return res.json(Response(constants.statusCode.unauth, constants.messages.imgNotUpload + err))
                    })
            })
        })
    } else {
        return res.json(Response(constants.statusCode.unauth, constants.messages.invalidImageFormat))
    }
}

exports.uploadVideo = (req, res) => {
    if (!req.body.type) return res.json(Response(constants.statusCode.unauth, constants.messages.uploadTypeReq))
    let UPLOADVIDEO

    switch (req.body.type) {
        case 'POSTVIDEO':
            UPLOADVIDEO = constants.directoryPath.POSTVIDEO
            break

        case 'PRODUCTVIDEO':
            UPLOADVIDEO = constants.directoryPath.PRODUCTVIDEO
            break
    }

    const randomStr = uuid.v4(),
        currentDate = Date.now(),
        randomName = randomStr + '-' + currentDate

    const size = req.files.file.size,
        imageBuffer = req.files.file.data,
        mimetype = req.files.file.mimetype,
        videoOriginalName = req.files.file.name

    // size should be less then 5mb
    if (size >= 5000000) return res.json(Response(constants.statusCode.unauth, constants.messages.videoSizeExceeded))

    if (mimetype == 'video/mp4' || mimetype == '	video/x-msvideo' || mimetype == 'video/x-ms-wmv') {
        const db_path = randomName + '_' + videoOriginalName
        const uploadLocation = UPLOADVIDEO + randomName + '_' + videoOriginalName

        fs.writeFile(uploadLocation, imageBuffer, function (imgerr) {
            if (imgerr) {
                return res.json(Response(constants.statusCode.unauth, constants.messages.internalServerError, imgerr))
            }

            fs.readFile(uploadLocation, function (err, data) {
                if (err) {
                    return res.json(Response(constants.statusCode.unauth, err))
                }
                return res.json(
                    Response(constants.statusCode.ok, constants.messages.video_upl, {
                        fullPath: uploadLocation,
                        imagePath: db_path,
                    })
                )
            })
        })
    } else {
        console.log('wrong format')
        return res.json(Response(constants.statusCode.unauth, constants.messages.invalidVideoFormat))
    }
}
exports.uploadPdf = (req, res) => {
    if (!req.body.type) return res.json(Response(constants.statusCode.unauth, constants.messages.uploadTypeReq))

    let UPLOADIPDF

    switch (req.body.type) {
        //IMAGE FOR COMPANY
        case 'POLICY':
            UPLOADIPDF = constants.directoryPath.POLICY
            break

        case 'EMPLOYEE_DOCUMENT':
            UPLOADIPDF = constants.directoryPath.EMPLOYEE_DOCUMENT
            break
    }

    //= constants.directoryPath.POLICY;

    const randomStr = uuid.v4(),
        currentDate = Date.now(),
        randomName = randomStr + '-' + currentDate

    const size = req.files.file.size,
        imageBuffer = req.files.file.data,
        mimetype = req.files.file.mimetype,
        docOriginalName = req.files.file.name

    // size should be less then 5mb
    if (size >= 5000000) return res.json(Response(constants.statusCode.unauth, constants.messages.sizeExceeded))
    // console.log("dvd", mimetype, req.files.file);

    if (mimetype == constants.pdfType || mimetype == constants.pdffileType || mimetype == constants.docType || mimetype == constants.oldDocType) {
        const db_path = randomName + '_' + docOriginalName
        const uploadLocation = UPLOADIPDF + randomName + '_' + docOriginalName

        fs.writeFile(uploadLocation, imageBuffer, function (err, data) {
            if (err) {
                return res.json(Response(constants.statusCode.unauth, constants.messages.internalServerError, err))
            }
            return res.json(
                Response(constants.statusCode.ok, constants.messages.addSuccess, {
                    fullPath: uploadLocation,
                    pdfFilePath: db_path,
                })
            )
        })
    } else {
        return res.json(Response(constants.statusCode.unauth, constants.messages.invalidDocFormat))
    }
}
exports.uploadCsv = (req, res) => {
    if (!req.body.type) return res.json(Response(constants.statusCode.unauth, constants.messages.uploadTypeReq))

    let UPLOADCSV

    switch (req.body.type) {
        //IMAGE FOR COMPANY
        case 'EMPLOYEE_CSV':
            UPLOADCSV = constants.directoryPath.EMPLOYEE_CSV
            break
        // case 'ATTENDANCE':
        //     UPLOADCSV = constants.directoryPath.ATTENDANCE_CSV
        //     break
    }

    //= constants.directoryPath.POLICY;

    const randomStr = uuid.v4(),
        currentDate = Date.now(),
        randomName = randomStr + '-' + currentDate

    const size = req.files.file.size,
        imageBuffer = req.files.file.data,
        mimetype = req.files.file.mimetype,
        docOriginalName = req.files.file.name

    if (mimetype == 'text/csv') {
        const db_path = randomName + '_' + docOriginalName
        const uploadLocation = UPLOADCSV + randomName + '_' + docOriginalName

        fs.writeFile(uploadLocation, imageBuffer, function (err) {
            if (err) {
                return res.json(Response(constants.statusCode.unauth, constants.messages.internalServerError, err))
            }
            return res.json(
                Response(constants.statusCode.ok, constants.messages.addSuccess, {
                    fullPath: uploadLocation,
                    csvFilePath: db_path,
                })
            )
        })
    } else {
        return res.json(Response(constants.statusCode.unauth, constants.messages.invalidDocFormat))
    }
}

exports.uploadAttendanceCsv = (req, res) => {
    if (!req.body.type) return res.json(Response(constants.statusCode.unauth, constants.messages.uploadTypeReq))

    let UPLOADCSV1 = constants.directoryPath.ATTENDANCE_CSV
    let ATTENDANCE_CSV1 = constants.directoryPath.ATTENDANCE_CSV1
    const randomStr = uuid.v4(),
        currentDate = Date.now(),
        randomName = randomStr + '-' + currentDate

    const size = req.files.file.size,
        imageBuffer = req.files.file.data,
        mimetype = req.files.file.mimetype,
        docOriginalName = req.files.file.name

    if (mimetype == 'text/csv') {
        const db_path = randomName + '_' + docOriginalName
        const uploadLocation = UPLOADCSV1 + randomName + '_' + docOriginalName
        const uploadLocation1 = ATTENDANCE_CSV1 + randomName + '_' + docOriginalName

        fs.writeFile(uploadLocation, imageBuffer, function (err) {
            if (err) {
                return res.json(Response(constants.statusCode.unauth, constants.messages.internalServerError, err))
            }

            // console.log('uploadLocation', config.backendUrl + uploadLocation1)
            // request(config.backendUrl + uploadLocation1, function (error, response, body) {
            // URL for live
            console.log('uploadLocation', config.baseUrl + uploadLocation1)
            request(config.baseUrl + uploadLocation1, function (error, response, body) {
                // Local url
                //URL for local
                let options = { type: 'array', separator: ',' }
                let arrayofArrays = convertCSVToArray(body, options)
                if (arrayofArrays.length > 1) {
                    if (arrayofArrays[0][0] !== 'empId' || arrayofArrays[0][1] !== 'inTime' || arrayofArrays[0][2] !== 'outTime') {
                        fs.unlink(uploadLocation, function (err) {
                            console.log('Error ', err)
                        })
                        return res.json(Response(constants.statusCode.validation, constants.messages.AttendanceCsvFormat))
                    } else {
                        return res.json(
                            Response(constants.statusCode.ok, constants.messages.addSuccess, {
                                fullPath: uploadLocation,
                                csvFilePath: db_path,
                            })
                        )
                    }
                } else {
                    fs.unlink(uploadLocation, function (err) {
                        console.log('Error ', err)
                    })
                    return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))


                }
            })
        })
    } else {
        return res.json(Response(constants.statusCode.unauth, constants.messages.invalidDocumentFormat))
    }
}
