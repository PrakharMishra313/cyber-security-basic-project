// Backward-compatibility shim:
// Historically this repo used a single monolithic router here.
// We now export the modular `/routes/api` router that keeps identical paths.
module.exports = require("./api");