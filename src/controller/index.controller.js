const User = require("../model/user.model");

const renderIndexPage = async (req, res) => {
	res.render("index");
};

module.exports = { renderIndexPage };
