module.exports = function (router) {
    var technology = require('./controllers/technology_controller')
    const auth = require('./../../../middleware/auth')

    router.post('/technology/add', auth, technology.addTechnology)
    router.post('/technology/list', technology.technologyList)
    router.post('/technology/empTechnologyList', technology.empTechnologyList)
    router.post('/technology/update', auth, technology.technologyUpdate)
    router.post('/technology/changeStatus', auth, technology.changeStatus)
    router.post('/technology/details', auth, technology.technologyDetails)
    router.post('/technology/delete', auth, technology.delete)

    return router
}
