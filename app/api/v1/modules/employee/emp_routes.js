const empCtrl = require('../employee/controllers/emp_ctrl'),
    middlewares = require('../../../../lib/middlewares')
const auth = require('./../../../middleware/auth')

module.exports = function (router) {
    router.post('/employee/add', auth, empCtrl.employeeAdd)
    router.post('/employee/list', empCtrl.empList)
    router.post('/employee/detail', auth, empCtrl.empDetail)
    router.post('/employee/uploadPdf', auth, middlewares.uploadPdf)
    router.post('/employee/uploadCsv', auth, middlewares.uploadCsv)
    router.post('/employee/edit', auth, empCtrl.empUpdate)
    router.post('/employee/companyUpdateEmp', auth, empCtrl.companyUpdateEmp)
    router.post('/employee/uploadImage', middlewares.uploadImage)
    router.post('/employee/reSend', empCtrl.reSend)
    router.post('/employee/reportingStructure/list', empCtrl.reportingStructureList)
    router.post('/employee/changeStatus', auth, empCtrl.changeStatus)
    router.post('/employee/isExist', empCtrl.isExistEmployee)
    router.post('/employee/Reporting/update', empCtrl.updateReporting)
    router.post('/employee/policyDetail', auth, empCtrl.policyDetail)

    return router
    
}
