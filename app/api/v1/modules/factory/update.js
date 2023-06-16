const Response = require('../../../../lib/response'),
  constants = require('../../../../lib/constants'),
  query = require('../../../../lib/common_query')

module.exports = async (req, res, next, data) => {
  try {
    const condition = { _id: data.id }
    const finalResult = await query.updateOneDocument(data.model, condition, data.updateData)

    if (!finalResult.status) {
      return res.json(Response(constants.statusCode.internalservererror, constants.messages.internalError))
    }

    if (finalResult.data) {
      return res.json(Response(constants.statusCode.ok, constants.messages.updateSuccess, finalResult.data))
    } else {
      return res.json(Response(constants.statusCode.notFound, constants.messages.noRecordFound))
    }
  } catch (error) {
  
    return res.json(Response(constants.statusCode.internalservererror, constants.messages.internalError))
  }
}
