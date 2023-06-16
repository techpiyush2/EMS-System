const { required } = require("joi");
const country = require("./controllers/country_controller"),
  auth = require("../../../middleware/auth");
module.exports = function (router) {
  router.post("/country/add", auth, country.addCountry);
  router.post("/country/update", auth, country.countryUpdate);
  router.post("/country/changeStatus", auth, country.changeStatus);
  router.post("/country/details", auth, country.countryDetails);
  router.post("/country/delete", auth, country.deleteCountry);
  router.post("/country/list", country.countryList);

  return router;
};
