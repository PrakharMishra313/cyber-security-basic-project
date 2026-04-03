const { Router } = require("express");
const intelCtrl = require("../controllers/intel.controller");

const router = Router();

router.post("/shodan",          intelCtrl.shodanSearch);
router.get("/shodan/:ip",       intelCtrl.shodanLookup);
router.post("/ip-info",         intelCtrl.ipInfo);
router.post("/whois",           intelCtrl.whois);
router.post("/check-password",  intelCtrl.checkPassword);

module.exports = router;