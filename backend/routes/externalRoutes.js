const express = require("express");
const router = express.Router();

const ext = require("../controllers/externalController");

router.get("/shodan/:ip", ext.shodan);
router.get("/ip/:ip", ext.ipLookup);

module.exports = router;