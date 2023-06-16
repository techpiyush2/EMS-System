module.exports = function (router) {
    var shifts = require('./controllers/shifts_controller')
    const auth = require('./../../../middleware/auth')

    router.post('/shifts/list', shifts.shiftsList)
    router.post('/shifts/changeStatus', auth, shifts.changeStatus)
    router.post('/shifts/details', auth, shifts.shiftsDetails)
    router.post('/shifts/delete', auth, shifts.delete)
    router.post('/shiftLeave/list', shifts.shiftLeaveList)

    return router
}
