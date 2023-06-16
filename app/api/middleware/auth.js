const jwt = require('jsonwebtoken')
const User = require('../v1/modules/user/models/user_model')
const userAuth = require('../v1/modules/user/models/user_auth')
const config = require('../../config/config').get(process.env.NODE_ENV)
const constants = require('../../../app/lib/constants')
const Response = require('../../../app/lib/response')
const query = require('../../lib/common_query')
const verifyToken = async (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token']

    if (!token) return res.status(403).send('A token is required for authentication')

    try {
        const condition = {
            token: req.headers['x-access-token'],
            userId: req.body.userId,
        }
        const isMatch = await query.findoneData(userAuth, condition)

        if (!isMatch.data) return res.json(Response(constants.statusCode.unauth, constants.messages.tokenExpire))
    } catch (err) {
        return res.json(Response(constants.statusCode.internalError, constants.messages.internalServerError, err))
    }
    return next()
}

module.exports = verifyToken
