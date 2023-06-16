const rolesandpermissions = require('./controllers/role_permission_controller')
middlewares = require('../../../../lib/middlewares')
const auth = require('./../../../middleware/auth')
module.exports = function (router) {
    //create
    router.post('/rolesandpermissions/add', rolesandpermissions.addRolesAndPermissions)
    router.post('/rolesandpermissions/list', rolesandpermissions.rolesAndPermissionList)
    router.post('/rolesandpermissions/details', rolesandpermissions.rolesAndPermissionDetails)

    return router
}
