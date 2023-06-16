const userCtrl = require('./controllers/user_ctrl'),
    middlewares = require('../../../../lib/middlewares')
const auth = require('./../../../middleware/auth')

module.exports = function (router) {
    //  router.post("/user/register", middlewares.getRoleId, userCtrl.userRegister);

    router.post('/user/login', userCtrl.login)
    router.post('/user/adminLogin', userCtrl.adminLogin)
    router.post('/user/register', userCtrl.userRegister)
    router.post('/user/logout', userCtrl.userLogout)
    router.post('/user/forgot', userCtrl.forgotPassword)
    router.post('/user/reset', userCtrl.resetPassword)
    router.post('/user/changePassword', auth, userCtrl.changePassword)
    router.post('/user/details', userCtrl.loginDetails)
    router.post('/admin/update', auth, userCtrl.adminUpdate)
    router.post('/user/checkToken', userCtrl.checkToken)
    router.post('/user/inviteUser', auth, userCtrl.inviteUser)
    router.post('/user/acceptInvitation', userCtrl.acceptInvitation)
    router.post('/user/declineInvitation', userCtrl.declineInvitation)
    router.post('/user/adminForgotPassword', userCtrl.adminForgotPassword)
    router.post('/user/companyForgotPassword', userCtrl.companyForgotPassword)
    router.post('/user/changeStatus', auth, userCtrl.changeStatus)
    router.post('/user/companyRegister', userCtrl.companySelfRegister)
    router.post('/user/list', userCtrl.userList)
    router.post('/user/hrList', userCtrl.hrList)
    router.post('/user/employeeList', userCtrl.employeeList)
    router.post('/user/assignReportingList', userCtrl.assignReportingList)

    router.post('/user/superAdminProfile', middlewares.uploadImage)

    // router.post("/user/approveLeave", userCtrl.approveLeave);

    return router
}
