const express = require("express");

const router = express.Router();

// Keep exact same paths as the old monolithic router:
router.use(require("./files.routes"));
router.use(require("./hash.routes"));
router.use(require("./threat.routes"));
router.use(require("./intel.routes"));
router.use(require("./core.routes"));

module.exports = router;

