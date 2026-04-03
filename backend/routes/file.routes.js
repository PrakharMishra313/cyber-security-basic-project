const { Router } = require("express");
const multer = require("multer");
const fileCtrl = require("../controllers/file.controller");

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload",        upload.single("file"), fileCtrl.uploadFile);
router.post("/download/:id",                         fileCtrl.downloadFile);
router.get("/files",                                 fileCtrl.listFiles);
router.get("/file/:id",                              fileCtrl.getFileInfo);

module.exports = router;
