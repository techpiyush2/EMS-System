const leaveCtrl = require('./controllers/leaveApply_ctrl'),
    middlewares = require('../../../../lib/middlewares')
const auth = require('./../../../middleware/auth')

module.exports = function (router) {
    router.post('/leaveApply/add', auth, leaveCtrl.addLeaveApply)
    router.post('/leaveApply/list', leaveCtrl.leaveApplyList)
    router.post('/leaveApply/approveLeave', leaveCtrl.approveLeave)
    router.post('/leaveApply/leaveWithdraw', leaveCtrl.withdrawLeave)
    router.post('/leaveApply/overview', leaveCtrl.leaveOverviewList)
    router.post('/leaveApply/Update', leaveCtrl.leaveApplyUpdate)
    router.post('/leaveApply/viewDetailList', leaveCtrl.viewDetailList)
    router.post('/leaveApply/applyTo', leaveCtrl.applyToList)
    router.post('/leaveApply/detail', leaveCtrl.leaveApplyDetail)
    router.post('/leaveApply/isExistReporting', leaveCtrl.isExistReporting)
    router.post('/leaveApply/leaveApplyMiddleware', middlewares.leaveApplyMiddleware)

    return router
}
