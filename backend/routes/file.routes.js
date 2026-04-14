const { Router } = require("express");
const fileCtrl = require("../controllers/file.controller");
const upload = require("../middlewares/upload");

const router = Router();

router.post("/upload",        upload.single("file"), fileCtrl.uploadFile);
router.post("/download/:id",                         fileCtrl.downloadFile);
router.get("/files",                                 fileCtrl.listFiles);
router.get("/file/:id",                              fileCtrl.getFileInfo);

module.exports = router;
