const router = require("express").Router();

router.use("/", require("./quote-comparison.js"));
module.exports = router;
