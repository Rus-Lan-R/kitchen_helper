const mongoose = require('mongoose')

const chatSchema = mongoose.Schema({
  message: String,
  authorID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
})

const Chat = mongoose.model('Chat', chatSchema)

module.exports = Chat
