const { Router } = require("express");
const multer = require("multer");
const networkCtrl = require("../controllers/network.controller");

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/scan-ports",      networkCtrl.portScan);
router.post("/subdomains",      networkCtrl.subdomainScan);
router.post("/header-analyze",  networkCtrl.headerAnalyze);
router.post("/metadata",        upload.single("file"), networkCtrl.fileMetadata);

module.exports = router;