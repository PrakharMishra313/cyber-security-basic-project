const { Router } = require("express");
const historyCtrl = require("../controllers/history.controller");

const router = Router();

router.post("/history", historyCtrl.saveHistory);
router.get("/history",  historyCtrl.getHistory);

module.exports = router;
