const { Router } = require("express");
const { renderChat } = require("../controller/chat.controller");

const router = Router();

router.route("/").get(renderChat);

module.exports = router;
