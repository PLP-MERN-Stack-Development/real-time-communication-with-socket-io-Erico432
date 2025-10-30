const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isPrivate: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
