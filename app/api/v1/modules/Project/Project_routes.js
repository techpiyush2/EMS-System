var project = require('./controllers/project_ctrl')
const auth = require('../../../middleware/auth')
module.exports = function (router) {
    router.post('/project/add', project.addProject)
    router.post('/project/list', project.projectList)
    router.post('/project/empProjects', project.empProjectList)
    router.post('/project/delete', project.Delete)
    router.post('/project/changeStatus', project.changeStatus)

    router.post('/project/update', auth, project.projectUpdate)
    router.post('/project/detail', project.projectDetails)
    router.post('/team/add', project.createTeam)
    router.post('/team/list', project.teamList)

    return router
}
