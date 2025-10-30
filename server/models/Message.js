const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    default: 'global',
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
  },
  fileUrl: String,
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    emoji: String,
  }],
  edited: {
    type: Boolean,
    default: false,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
