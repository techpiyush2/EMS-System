const roles = require("./controllers/role_controller");
middlewares = require("../../../../lib/middlewares");
const auth = require("./../../../middleware/auth");
module.exports = function (router) {
  //create
  router.post("/roles/createRole", roles.addRole);

  router.post("/roles/updateData", roles.updateData);

  router.post("/roles/details", roles.details);

  router.post("/roles/list", roles.rolesList);

  return router;
};
