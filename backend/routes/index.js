/**
 * routes/index.js
 *
 * Single mount point for all API routes.
 * Mounted at /api in server.js.
 *
 * Route map:
 *   File       → POST /upload, POST /download/:id, GET /files, GET /file/:id
 *   Hash       → POST /hash, POST /verify, POST /integrity
 *   Threat     → POST /scan, POST /scan-url
 *   VirusTotal → POST /vt-file, GET /vt-analysis/:id, GET /vt-file/:hash,
 *                POST /vt-url, GET /vt-url/:id, GET /vt-ip/:ip, GET /vt-domain/:domain
 *   Intel      → POST /shodan, GET /shodan/:ip, POST /ip-info, POST /whois,
 *                POST /check-password
 *   Network    → POST /scan-ports, POST /subdomains, POST /header-analyze, POST /metadata
 *   Health     → GET /health
 *   History    → POST /history, GET /history
 */
const router = require("express").Router();

const fileRoutes = require("./file.routes");
const hashRoutes = require("./hash.routes");
const historyRoutes = require("./history.routes");
const intelRoutes = require("./intel.routes");
const networkRoutes = require("./network.routes");
const threatRoutes = require("./threat.routes");
const vtRoutes = require("./virustotal.routes");

router.use(fileRoutes);
router.use(hashRoutes);
router.use(historyRoutes);
router.use(intelRoutes);
router.use(networkRoutes);
router.use(threatRoutes);
router.use(vtRoutes);

module.exports = router;
