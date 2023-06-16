module.exports = function (router) {
    var shifts = require('./controllers/shifts_controller')
    const auth = require('./../../../middleware/auth')

    //create
    router.post('/shifts/add', auth, shifts.addShifts)
    router.post('/shifts/list', shifts.shiftsList)
    router.post('/shifts/update', auth, shifts.shiftsUpdate)
    router.post('/shifts/changeStatus', auth, shifts.changeStatus)
    router.post('/shifts/details', auth, shifts.shiftsDetails)
    router.post('/shifts/delete', auth, shifts.delete)
    // DONE
    router.post('/shiftLeave/list', shifts.shiftLeaveList)
    router.post('/shiftLocation/details', shifts.shiftLocationDetails)
    return router
}
