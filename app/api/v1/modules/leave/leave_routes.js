const leavePolicyCtrl = require('./controllers/leavePolicy_ctrl')

const auth = require('./../../../middleware/auth')

module.exports = function (router) {
    router.post('/leave/add', auth, leavePolicyCtrl.addLeavePolicy)
    router.post('/leave/list', leavePolicyCtrl.leavePolicyList)
    router.post('/leave/update', auth, leavePolicyCtrl.leavePolicyUpdate)
    router.post('/leave/detail', auth, leavePolicyCtrl.leavePolicyDetail)
    router.post('/leave/delete', auth, leavePolicyCtrl.delete)
    router.post('/leave/changeStatus', auth, leavePolicyCtrl.changeStatus)
    return router
}
