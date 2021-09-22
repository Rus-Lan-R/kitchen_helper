const mongoose = require("mongoose");

const LoggSheme = mongoose.Schema({
  message_id: { type: Number },
  from: {
    id: { type: Number },
    is_bot: { type: Boolean },
    first_name: { type: String },
    last_name: { type: String },
    username: { type: String },
    language_code: { type: String },
  },
  chat: {
    id: { type: Number },
    first_name: { type: String },
    last_name: { type: String },
    username: { type: String },
    type: { type: String },
  },
  date: { type: Number },
  text: { type: String },
  entities: [{ offset: { type: Number }, length: { type: Number }, type: { type: String } }],
});

const LoggsTG = mongoose.model("Logg", LoggSheme);

module.exports = LoggsTG;
