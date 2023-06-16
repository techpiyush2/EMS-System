var typeOfWork = require('./controllers/typeOfWork_ctrl')
const auth = require('./../../../middleware/auth')
module.exports = function (router) {
    router.post('/typeOfWork/add', auth, typeOfWork.addTypeOfWork)
    router.post('/typeOfWork/details', auth, typeOfWork.typeOfWorkDetails)
    router.post('/typeOfWork/update', auth, typeOfWork.TypeOfWorkUpdate)
    router.post('/typeOfWork/list', typeOfWork.TypeOfWorkList)
    router.post('/typeOfWork/changeStatus', auth, typeOfWork.changeStatus)
    return router
}
