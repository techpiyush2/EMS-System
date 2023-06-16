const documentCtrl = require("../document/controllers/document_controller"),
  middlewares = require("../../../../lib/middlewares");
const auth = require("./../../../middleware/auth");

module.exports = function (router) {
  router.post("/document/add", auth, documentCtrl.documentAdd);
  router.post("/document/list", documentCtrl.documentList);
  router.post("/document/edit", auth, documentCtrl.documentUpdate);
  router.post("/document/detail", auth, documentCtrl.documentDetail);
  router.post("/document/delete", auth, documentCtrl.delete);
  router.post("/document/changeStatus", auth, documentCtrl.changeStatus);

  return router;
};
