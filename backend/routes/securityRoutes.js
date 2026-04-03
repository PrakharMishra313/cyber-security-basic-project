const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");
const sec = require("../controllers/securityController");

// 🛡️ FILE
router.post("/vt-file", upload.single("file"), sec.scanFile);
router.get("/vt-file/:hash", sec.fileReport);

// 🌐 URL
router.post("/vt-url", sec.scanURL);
router.get("/vt-url/:id", sec.urlReport);

// 🌍 IP
router.get("/vt-ip/:ip", sec.ipReport);

// 🔎 DOMAIN
router.get("/vt-domain/:domain", sec.domainReport);

module.exports = router;