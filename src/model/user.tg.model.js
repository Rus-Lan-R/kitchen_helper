const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
	chatId: { type: String, required: true, unique: true },
	is_bot: { type: Boolean },
	is_Admin: { type: Boolean, default: false },
	first_name: { type: String },
	last_name: { type: String },
	username: { type: String },
	language_code: { type: String },
	count_requests: { type: Number, default: 0 },
});

const UserTG = mongoose.model("UserTG", userSchema);

module.exports = UserTG;
