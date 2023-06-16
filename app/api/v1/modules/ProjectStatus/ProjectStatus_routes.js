var projectStatus = require('./controllers/projectStatus_ctrl')
const auth = require('../../../middleware/auth')
module.exports = function (router) {
    router.post('/projectStatus/add', auth, projectStatus.ProjectStatusAdd)
    router.post('/projectStatus/list', projectStatus.projectStatusList)
    // router.post("/project/delete", project.Delete);
    // router.post("/project/changeStatus", project.changeStatus);

    router.post('/projectStatus/update', auth, projectStatus.projectStatusUpdate)
    router.post('/projectStatus/detail', auth, projectStatus.projectStatusDetails)

    return router
}
