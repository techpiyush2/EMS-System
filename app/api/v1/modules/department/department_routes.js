var department = require('./controllers/department_ctrl')
const auth = require('./../../../middleware/auth')
module.exports = function (router) {
    router.post('/department/add', auth, department.addDepartment)
    router.post('/department/details', auth, department.departmentDetails)
    router.post('/department/update', auth, department.departmentUpdate)
    router.post('/department/list', department.departmentList)
    router.post('/department/delete', auth, department.delete)
    router.post('/department/empDepartmentCount', department.empDepartmentCount)
    router.post('/department/changeStatus', auth, department.changeStatus)
    router.post('/department/empDepartmentList', department.empDepartmentList)
    return router
}
