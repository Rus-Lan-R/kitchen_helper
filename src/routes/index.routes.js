const { Router } = require("express");
const { renderIndexPage } = require("../controller/index.controller");

const router = Router();

router.route("/").get(renderIndexPage);

module.exports = router;
