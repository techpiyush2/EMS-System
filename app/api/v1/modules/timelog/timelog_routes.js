const tileLogCtrl = require('../timelog/controllers/timelog_ctrl'),
    middlewares = require('../../../../lib/middlewares')
const auth = require('./../../../middleware/auth')

module.exports = function (router) {
    router.post('/timeLog/add', tileLogCtrl.addTimeLog)
    router.post('/timeLog/list', tileLogCtrl.timeLogList)
    router.post('/timeLog/delete', tileLogCtrl.deleteTask)
    router.post('/taskPending/list', tileLogCtrl.pendingStatusList)
    router.post('/timelog/notFilled', tileLogCtrl.notFilledEmp)
    router.post('/timelog/isBlocked', tileLogCtrl.isBlocked)

    return router
}
