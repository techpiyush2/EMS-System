const middlewares = require('../../../../lib/middlewares'),
    attendance = require('./controllers/attendance_ctrl')
const auth = require('../../../middleware/auth')

module.exports = function (router) {

    router.post('/attendance/details', attendance.attendanceDetails)

    router.post('/attendance/monthly/details', attendance.attendanceMonthlyDetails)
    router.post('/attendanceRegularized/update', attendance.attendanceRegularized)
    router.post('/attendanceRegularized/status', attendance.attendanceStatus)
    router.post('/attendanceRegularized/details', attendance.attendanceRegularizedDetails)

    router.post('/attendanceRegularized/list', attendance.attendanceRegularizedList)
    return router
}
