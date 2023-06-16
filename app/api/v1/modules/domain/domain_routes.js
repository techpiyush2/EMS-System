module.exports = function (router) {
  var domain = require("../domain/controllers/domain_controller");
  middlewares = require("../../../../lib/middlewares");
  const auth = require("./../../../middleware/auth");

  //create
  router.post("/domain/addDomain", auth, domain.addDomain);
  // // READ
  // router.post('/roles/list', roles.rolesList)
  // // router.post('/roles/getRoleId', middlewares.getRoleId)

  // // UPDATE AND DELETE
  router.post("/domain/edit", auth, domain.domainEdit);
  router.post("/domain/changeStatus", auth, domain.changeStatus);
  router.post("/domain/details", auth, domain.domainDetails);
  router.post("/domain/delete", auth, domain.delete);
  router.post("/domain/list", domain.domainList);

  return router;
};
