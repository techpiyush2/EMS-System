var branch = require('./controllers/branch_ctrl')
const auth = require('./../../../middleware/auth')
module.exports = function (router) {
    router.post('/branch/add', auth, branch.addBranch)
    router.post('/branch/details', auth, branch.branchDetails)
    router.post('/branch/update', auth, branch.branchUpdate)
    router.post('/branch/list', branch.branchList)
    router.post('/branch/delete', auth, branch.deleteBranch)
    router.post('/branch/changeStatus', auth, branch.changeStatus)
    router.post('/shiftWiseLocation/list', branch.shiftWiseLocationList)
    return router;
}
