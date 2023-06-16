module.exports = function (router) {
  var shiftRotation = require("./controllers/shiftRotation_controller");
  const auth = require("../../../middleware/auth");

  //create
  router.post("/shiftRotation/add", auth, shiftRotation.addShiftRotation);
  router.post("/shiftRotation/list", shiftRotation.shiftRotationList);
  router.post("/shiftRotation/update", auth, shiftRotation.shiftRotationUpdate);
  router.post("/shiftRotation/changeStatus", auth, shiftRotation.changeStatus);
  router.post(
    "/shiftRotation/details",
    auth,
    shiftRotation.shiftRotationDetails
  );
  router.post("/shiftRotation/delete", auth, shiftRotation.delete);

  return router;
};
