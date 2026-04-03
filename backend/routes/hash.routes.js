const { Router } = require("express");
const multer = require("multer");
const hashCtrl = require("../controllers/hash.controller");

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/hash",       upload.single("file"), hashCtrl.computeHash);
router.post("/verify",     upload.single("file"), hashCtrl.verifyHash);
router.post("/integrity",  upload.single("file"), hashCtrl.checkIntegrity);

module.exports = router;