const nationalityCtrl = require("../nationality/controllers/nationality_controller"),
  middlewares = require("../../../../lib/middlewares");
const auth = require("./../../../middleware/auth");

module.exports = function (router) {
  router.post("/nationality/add", auth, nationalityCtrl.nationalityAdd);
  router.post("/nationality/list", nationalityCtrl.nationalityList);
  router.post("/nationality/edit", auth, nationalityCtrl.nationalityUpdate);
  router.post("/nationality/detail", auth, nationalityCtrl.nationalityDetail);
  router.post("/nationality/delete", auth, nationalityCtrl.delete);
  router.post("/nationality/changeStatus", auth, nationalityCtrl.changeStatus);

  return router;
};
