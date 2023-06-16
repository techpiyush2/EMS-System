var designation = require('./controllers/designation_ctrl')
const auth = require('./../../../middleware/auth')
module.exports = function (router) {
    router.post('/designation/add', auth, designation.addDesignation)
    router.post('/designation/details', auth, designation.designationDetails)
    router.post('/designation/update', auth, designation.designationUpdate)
    router.post('/designation/list', designation.designationList)
    router.post('/designation/delete', auth, designation.delete)
    router.post('/designation/changeStatus', auth, designation.changeStatus)
    router.post('/designation/uniqueDesignationDetails', designation.uniqueDesignationDetails)
    router.post('/designationEmp/Details', designation.designationEmpDetails)
    router.post('/designation/empDesignationList', designation.empDesignationList)

    return router
}
