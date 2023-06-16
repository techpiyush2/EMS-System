'use strict'

const catchAsync = require('../../../../../lib/catchAsync'),
    Response = require('../../../../../../app/lib/response'),
    constants = require('../../../../../../app/lib/constants'),
    query = require('../../../../../../app/lib/common_query'),
    utility = require('./../../../../../lib/utility'),
    mailer = require('./../../../../../lib/mailer'),
    mongoose = require('mongoose'),
    User = require('./../../../../v1/modules/user/models/user_model'),
    config = require('../../../../../config/config').get(process.env.NODE_ENV)

exports.changePassword = catchAsync(async (req, res) => {
    const { id, oldPassword, newPassword, confirmPassword } = req.body
    const condition = { _id: id }
    const user = await query.findoneData(User, condition)
    if (user.status && user.data) {
        // Checking the input old password is same it is in database or not
        user.data.comparePassword(oldPassword, async (err, isMatch) => {
            if (err) {
                return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
            }
            if (isMatch === false) {
                return res.json(Response(constants.statusCode.internalServerError, constants.messages.wrongOldPswd))
            }

            // If old password is correct update the password using .save()
            // await user.saveAndUpadate() ( THIS WILL DISABLE THE VALIDATORS AND userSchema.pre FUNCTIONS )
            user.data.password = newPassword
            user.data.passwordConfirm = confirmPassword

            user.data.save(async function (err, data) {
                if (err) {
                    res.json(Response(constants.statusCode.internalServerError, err))
                } else {
                    return res.json(Response(constants.statusCode.ok, constants.messages.pswdChangeSuccess))
                }
            })
        })
    } else {
        return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError))
    }
})

exports.forgotPassword = catchAsync(async (req, res) => {
    const condition = {}

    if (req.body.email) condition.email = req.body.email
    else if (req.body.userId) condition._id = mongoose.Types.ObjectId(req.body.userId)
    else return res.json(Response(constants.statusCode.unauth, constants.messages.requiredFieldsMissing))

    const finalResult = await query.findoneData(User, condition)

    // Checking the database response
    if (!finalResult.status) return res.json(Response(constants.statusCode.internalservererror, constants.messages.internalservererror))

    if (!finalResult.data || !finalResult.data.email) return res.json(Response(constants.statusCode.notFound, constants.messages.userNotFound))

    if (!finalResult.data.isActive) return res.json(Response(constants.statusCode.forbidden, constants.messages.accountNotActive))

    if (finalResult.data.isDeleted) return res.json(Response(constants.statusCode.notFound, constants.messages.accountDeleted))

    const otpOptions = Math.floor(Math.random() * 10000 + 1)
    // Sending email
    const printContents = {
        userId: finalResult.data._id,
        email: finalResult.data.email,
        userName: finalResult.data.firstName,
        otp: otpOptions,
    }
    const options = {
        to: finalResult.data.email,
        subject: constants.email.forgotPasswordTitle,
    }
    const mailResponse = await mailer.forgotPasswordMobileEmail(options, printContents)

    const hash = utility.hashOtp(printContents.otp + finalResult.data._id.toString())

    const finalObjectToBeSend = { hash, userId: finalResult.data._id }

    if (mailResponse) {
        return res.json(Response(constants.statusCode.ok, constants.messages.forgotPasswordSuccess, finalObjectToBeSend))
    } else {
        return res.json(Response(constants.statusCode.internalError, constants.messages.emailNotSend))
    }
})

exports.resetPassword = catchAsync(async (req, res) => {
    const { hash, newPassword, otp, userId } = req.body

    if (!hash) {
        return res.json(Response(constants.statusCode.internalError, constants.messages.hashReq))
    }
    if (!newPassword) {
        return res.json(Response(constants.statusCode.internalError, constants.messages.passwordRequired))
    }
    if (!otp) {
        return res.json(Response(constants.statusCode.internalError, constants.messages.otpReq))
    }
    if (!userId || !mongoose.isValidObjectId(userId)) {
        return res.json(Response(constants.statusCode.internalError, constants.messages.userIdRequired))
    }

    const condition = { _id: mongoose.Types.ObjectId(userId) }
    const userObj = await query.findoneData(User, condition, { password: 1 })

    if (!userObj.status || !userObj.data) {
        return res.json(Response(constants.statusCode.error, constants.messages.userNotFound))
    }

    const newHash = utility.hashOtp(otp.toString() + userId.toString())

    if (newHash != hash) {
        return res.json(Response(constants.statusCode.notFound, constants.messages.invalid_otp))
    }

    userObj.data.password = newPassword
    userObj.data.save(async function (err, data) {
        if (err) {
            res.json(Response(constants.statusCode.internalservererror, err))
        } else {
            return res.json(Response(constants.statusCode.ok, constants.messages.pswdChangeSuccess))
        }
    })
})
