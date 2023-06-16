const middlewares = require('../../../../lib/middlewares'),
    attendance = require('./controllers/attendance_ctrl')
const auth = require('../../../middleware/auth')

module.exports = function (router) {
    // router.post("/attendance/upload", auth, attendance.uploadFile);
    // router.post('/attendance/upload', auth, middlewares.uploadCsv)
    router.post('/attendance/uploadAttendanceCsv', auth, middlewares.uploadAttendanceCsv)
    router.post('/attendance/add', auth, attendance.addAttendance)
    router.post('/attendance/list', attendance.attendanceList)
    router.post('/attendance/graph', attendance.attendanceGraphList)
    router.post('/attendanceRegularized/update', attendance.attendanceRegularized)
    router.post('/attendanceRegularized/status', attendance.attendanceStatus)
    router.post('/attendanceRegularized/details', attendance.attendanceDetails)
    router.post('/attendanceRegularized/list', attendance.attendanceRegularizedList)
    router.post('/attendance/graph/list', attendance.attendanceGraphList)
    router.post('/attendance/monthly/details', attendance.attendanceMonthlyDetails)
    router.post('/attendance/empRegularizedList', attendance.empRegularizedList)
    router.post('/attendance/cron', attendance.attendanceCron)
    return router
} 