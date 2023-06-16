const state = require('./controllers/state_controller')
const auth = require('./../../../middleware/auth')
module.exports = function (router) {
    //create
    router.post('/state/add', auth, state.addState)
    router.post('/state/update', auth, state.stateUpdate)
    router.post('/state/changeStatus', auth, state.changeStatus)
    router.post('/state/details', auth, state.stateDetails)
    router.post('/state/delete', auth, state.deleteState)
    router.post('/state/list', state.stateList)

    return router
}
