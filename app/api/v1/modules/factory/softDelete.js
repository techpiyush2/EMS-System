const catchAsync = require('../../../../lib/catchAsync'),
    constants = require('../../../../lib/constants'),
    Response = require('../../../../lib/response'),
    query = require('../../../../lib/common_query')

module.exports = (Model) =>
    catchAsync(async (req, res) => {
        if (Object.keys(req.body).length === 0 && req.body.constructor === Object) return res.json(Response(constants.statusCode.unauth, constants.messages.requiredFieldsMissing))

        if (!req.body._id) return res.json(Response(constants.statusCode.unauth, constants.messages.idReq))

        const condition = { _id: req.body._id }
        const updateData = { isDeleted: true }

        const finalResult = await query.updateOneDocument(Model, condition, updateData)

        if (!finalResult.status) {
            return res.json(Response(constants.statusCode.internalServerError, constants.messages.internalServerError, err))
        }
        if (!finalResult.data) {
            return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
        }

        return res.json(Response(constants.statusCode.ok, constants.messages.delSuccess, finalResult.data))
    })
