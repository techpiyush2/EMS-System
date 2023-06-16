const empCtrl = require('../employee/controllers/emp_ctrl'),
    middlewares = require('../../../../lib/middlewares')
const auth = require('../../../middleware/auth')

module.exports = function (router) {
    router.post('/employee/login', empCtrl.empLogin)
    router.post('/employee/detail', empCtrl.empDetail)
    router.post('/employee/update', empCtrl.empUpdate)

    return router
}
