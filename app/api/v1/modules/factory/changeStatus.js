const catchAsync = require('../../../../lib/catchAsync'),
    Response = require('../../../../lib/response'),
    constants = require('../../../../lib/constants'),
    query = require('../../../../lib/common_query')

module.exports = (Model) =>
    catchAsync(async (req, res) => {
        if (Object.keys(req.body).length === 0 && req.body.constructor === Object) return res.json(Response(constants.statusCode.unauth, constants.messages.requiredFieldsMissing))
        if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

        if (typeof req.body.isActive !== 'boolean') return res.json(Response(constants.statusCode.unauth, constants.messages.isActive))

        const condition = { _id: req.body._id }
        const updateData = { isActive: !req.body.isActive }

        const finalResult = await query.updateOneDocument(Model, condition, updateData)

        const msg = req.body.isActive ? constants.messages.deActivated : constants.messages.activated

        if (!finalResult.status) return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError, err))

        if (finalResult.data) return res.json(Response(constants.statusCode.ok, msg, finalResult.data))
        else return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
    })
