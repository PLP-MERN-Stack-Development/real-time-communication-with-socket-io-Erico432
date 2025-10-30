const Message = require('../models/Message');
const User = require('../models/User');

exports.sendMessage = async (data, userId) => {
  try {
    const { content, room, recipient, type, fileUrl } = data;

    const message = await Message.create({
      sender: userId,
      content,
      room: room || 'global',
      recipient,
      type: type || 'text',
      fileUrl,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar')
      .populate('recipient', 'username avatar');

    return { success: true, message: populatedMessage };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

exports.getMessages = async (room, limit = 50, page = 1) => {
  try {
    const skip = (page - 1) * limit;

    const messages = await Message.find({ room, deleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar')
      .populate('recipient', 'username avatar');

    return { success: true, messages: messages.reverse() };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

exports.markAsRead = async (messageId, userId) => {
  try {
    const message = await Message.findById(messageId);
    
    if (!message) {
      return { success: false, message: 'Message not found' };
    }

    const alreadyRead = message.readBy.some(
      (read) => read.user.toString() === userId
    );

    if (!alreadyRead) {
      message.readBy.push({ user: userId, readAt: new Date() });
      await message.save();
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

exports.addReaction = async (messageId, userId, emoji) => {
  try {
    const message = await Message.findById(messageId);
    
    if (!message) {
      return { success: false, message: 'Message not found' };
    }

    const existingReaction = message.reactions.findIndex(
      (reaction) => reaction.user.toString() === userId && reaction.emoji === emoji
    );

    if (existingReaction > -1) {
      message.reactions.splice(existingReaction, 1);
    } else {
      message.reactions.push({ user: userId, emoji });
    }

    await message.save();

    return { success: true, message };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
