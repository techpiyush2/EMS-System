module.exports = function (express) {
    const router = express.Router()

    require('./modules/employee/emp_routes')(router)
    require('./modules/user/user_routes')(router)
    require('./modules/attendance/attendance_routes')(router)
    require('./modules/leaveApply/leaveApply_routes')(router)
    require('../mobile/modules/shift/shifts_routes')(router)

    return router
}
