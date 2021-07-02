const Chat = require("../model/chat.model");

const renderChat = async (req, res) => {
	const allMessages = await Chat.find().populate("authorID").lean();
	res.render("chat", { allMessages });
};

module.exports = { renderChat };
