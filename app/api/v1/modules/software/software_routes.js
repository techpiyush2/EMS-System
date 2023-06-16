var software = require('./controllers/software_ctrl')
const auth = require('./../../../middleware/auth')
module.exports = function (router) {
    router.post('/software/add', auth, software.addSoftware)
    router.post('/software/details', auth, software.softwareDetails)
    router.post('/software/update', auth, software.softwareUpdate)
    router.post('/software/list', software.softwareList)
    router.post('/software/delete', auth, software.delete)
    router.post('/software/changeStatus', auth, software.changeStatus)
    router.post('/software/testSoftwareReminderCron', software.softwareReminderCron)

    return router
}
