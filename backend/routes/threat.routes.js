const { Router } = require("express");
const multer = require("multer");
const threatCtrl = require("../controllers/threat.controller");

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/scan",      upload.single("file"), threatCtrl.scanFile);
router.post("/scan-url",                         threatCtrl.scanURL);

module.exports = router;