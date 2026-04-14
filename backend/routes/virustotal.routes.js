const { Router } = require("express");
const vtCtrl = require("../controllers/virustotal.controller");
const upload = require("../middlewares/upload");

const router = Router();

router.post("/vt-file",          upload.single("file"), vtCtrl.scanFile);
router.get("/vt-analysis/:id",                          vtCtrl.analysisReport);
router.get("/vt-file/:hash",                            vtCtrl.fileReport);
router.post("/vt-url",                                  vtCtrl.scanURL);
router.get("/vt-url/:id",                               vtCtrl.urlReport);
router.get("/vt-ip/:ip",                                vtCtrl.ipReport);
router.get("/vt-domain/:domain",                        vtCtrl.domainReport);

module.exports = router;
