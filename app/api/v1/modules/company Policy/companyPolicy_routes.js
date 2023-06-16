const policyCtrl = require('./controllers/companyPolicy_ctrl'),
    middlewares = require('../../../../lib/middlewares')
const auth = require('./../../../middleware/auth')
const { leaveMsg } = require('../../../../lib/constants')

module.exports = function (router) {
    router.post('/policy/add', auth, policyCtrl.policyAdd)
    router.post('/policy/list', policyCtrl.policyList)
    router.post('/policy/update', auth, policyCtrl.policyUpdate)
    router.post('/policy/detail', auth, policyCtrl.policyDetail)
    router.post('/policy/file', middlewares.uploadPdf)
    router.post('/policy/delete', auth, policyCtrl.delete)
    router.post('/policy/acceptPolicy', policyCtrl.empAcceptPolicy)
    router.post('/policy/changeStatus', auth, policyCtrl.changeStatus)
    return router
}
