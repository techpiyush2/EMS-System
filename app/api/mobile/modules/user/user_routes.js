const userCtrl = require('./controllers/user_ctrl'),
    middlewares = require('../../../../lib/middlewares')
const auth = require('./../../../middleware/auth')

module.exports = function (router) {
    router.post('/user/forgot', userCtrl.forgotPassword)
    router.post('/user/reset', userCtrl.resetPassword)
    router.post('/user/changePassword', userCtrl.changePassword)

    return router
}
