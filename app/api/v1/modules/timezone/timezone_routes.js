var timezone = require("./controllers/timezone_ctrl");

module.exports = function (router) {
  router.post("/timezone/add", timezone.addTime);
  router.post("/timezone/details", timezone.timedetails);
  router.post("/timezone/update", timezone.timeUpdate);
  router.post("/timezone/Status", timezone.changeStatus);
  router.post("/timezone/delete", timezone.delete);
  router.post("/timezone/list", timezone.timezoneList);

  return router;
};
