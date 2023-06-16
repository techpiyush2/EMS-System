const leaveCtrl = require('./controllers/leaveApply_ctrl'),
    middlewares = require('../../../../lib/middlewares')
const auth = require('./../../../middleware/auth')

module.exports = function (router) {
    router.post('/leaveApply/add', leaveCtrl.addLeaveApply)

    return router
}
