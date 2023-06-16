const companyCtrl = require('./controllers/company_ctrl'),
    middlewares = require('../../../../lib/middlewares')
const auth = require('./../../../middleware/auth')
const { company } = require('../../../../lib/constants')

module.exports = function (router) {
    router.post('/company/add', auth, companyCtrl.addCompany)
    router.post('/company/detail', auth, companyCtrl.companyDetails)
    router.post('/company/list', companyCtrl.companyList)
    router.post('/company/edit', auth, companyCtrl.companyEdit)
    router.post('/company/delete', auth, companyCtrl.deleteCompany)
    router.post('/company/uploadImage', auth, middlewares.uploadImage)
    router.post('/company/delete', auth, companyCtrl.deleteCompany)
    router.post('/company/changeStatus', auth, companyCtrl.changeStatus)

    return router
}
