const constants = require('./constants'),
    Response = require('./response')

module.exports = catchAsync = (fn) => {
    return (req, res, next) =>
        fn(req, res, next).catch((error) => {
            if (error.isJoi) {
                res.json({
                    code: constants.statusCode.validation,
                    message: error.details[0].message,
                    error: process.env.NODE_ENV == 'local' ? error : {},
                })
            } else if (error.name == 'ValidationError') {
                res.json({
                    code: constants.statusCode.validation,
                    message: constants.messages.validationError,
                    error: process.env.NODE_ENV == 'local' ? error : {},
                })
            } else {
                res.json({
                    code: constants.statusCode.internalservererror,
                    message: constants.messages.internalError,
                    error: process.env.NODE_ENV == 'local' ? error : {},
                })
            }
        })
}
