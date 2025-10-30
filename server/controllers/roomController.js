const Room = require('../models/Room');

exports.createRoom = async (data, userId) => {
  try {
    const { name, description, isPrivate } = data;

    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return { success: false, message: 'Room already exists' };
    }

    const room = await Room.create({
      name,
      description,
      isPrivate,
      members: [userId],
      admins: [userId],
      createdBy: userId,
    });

    return { success: true, room };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

exports.getRooms = async () => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .populate('createdBy', 'username avatar')
      .populate('members', 'username avatar status');

    return { success: true, rooms };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

exports.joinRoom = async (roomId, userId) => {
  try {
    const room = await Room.findById(roomId);

    if (!room) {
      return { success: false, message: 'Room not found' };
    }

    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    return { success: true, room };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
