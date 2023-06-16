module.exports = function (router) {
    var skills = require('./controllers/skills_controller')
    const auth = require('./../../../middleware/auth')

    //create
    router.post('/skills/add', auth, skills.addSkills)
    router.post('/skills/list', skills.skillsList)
    router.post('/skills/update', auth, skills.skillsUpdate)
    router.post('/skills/changeStatus', auth, skills.changeStatus)
    router.post('/skills/details', auth, skills.skillsDetails)
    router.post('/skills/delete', auth, skills.delete)
    router.post('/skills/empSkillsList', skills.empSkillsList)

    return router
}
