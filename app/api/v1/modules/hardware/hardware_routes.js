const hardwareCtrl = require('./controllers/hardware_ctrl')
const auth = require('./../../../middleware/auth')

module.exports = function (router) {
    router.post('/hardware/add', auth, hardwareCtrl.addHardware)
    router.post('/hardware/list', hardwareCtrl.hardwareList)
    router.post('/hardware/detail', auth, hardwareCtrl.hardwareDetails)
    router.post('/hardware/update', auth, hardwareCtrl.hardwareUpdate)
    router.post('/hardware/delete', auth, hardwareCtrl.delete)
    router.post('/hardware/changeStatus', auth, hardwareCtrl.changeStatus)

    return router
}
