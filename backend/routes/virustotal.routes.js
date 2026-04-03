const { Router } = require("express");
const multer = require("multer");
const vtCtrl = require("../controllers/virustotal.controller");

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/vt-file",          upload.single("file"), vtCtrl.scanFile);
router.get("/vt-analysis/:id",                          vtCtrl.analysisReport);
router.get("/vt-file/:hash",                            vtCtrl.ipReport);
router.post("/vt-url",                                  vtCtrl.scanURL);
router.get("/vt-url/:id",                               vtCtrl.urlReport);
router.get("/vt-ip/:ip",                                vtCtrl.ipReport);
router.get("/vt-domain/:domain",                        vtCtrl.domainReport);
console.log("🔥 VT ROUTES LOADED");

module.exports = router;