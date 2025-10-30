const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const authController = require('../controllers/authController');
const messageController = require('../controllers/messageController');
const roomController = require('../controllers/roomController');

const userSockets = new Map();
const typingUsers = new Map();

module.exports = (io) => {
  // Authentication middleware - removed token requirement for auth events
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
          const user = await User.findById(decoded.id).select('-password');
          if (user) {
            socket.userId = user._id.toString();
            socket.user = user;
          }
        }
      }
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user ? socket.user.username : 'Anonymous'} (${socket.id})`);

    // Only perform authenticated actions if user is authenticated
    if (socket.user) {
      // Store socket connection
      userSockets.set(socket.userId, socket.id);

      // Update user status to online
      User.findByIdAndUpdate(socket.userId, {
        status: 'online',
        lastSeen: new Date(),
      }).exec();

      // Emit online users
      socket.broadcast.emit('user:online', {
        userId: socket.userId,
        username: socket.user.username,
        avatar: socket.user.avatar,
      });

      // Join global room by default
      socket.join('global');

      // Send online users list
      emitOnlineUsers(io);
    }

    // === AUTHENTICATION EVENTS ===
    socket.on('auth:register', async (data, callback) => {
      const result = await authController.register(data);
      callback(result);
    });

    socket.on('auth:login', async (data, callback) => {
      const result = await authController.login(data);
      callback(result);
    });

    // === MESSAGE EVENTS ===
    socket.on('message:send', async (data, callback) => {
      if (!socket.user) {
        return callback({ success: false, message: 'Authentication required' });
      }

      const result = await messageController.sendMessage(data, socket.userId);

      if (result.success) {
        // Send to room or recipient
        if (data.recipient) {
          const recipientSocketId = userSockets.get(data.recipient);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit('message:new', result.message);
          }
          socket.emit('message:new', result.message);
        } else {
          io.to(data.room || 'global').emit('message:new', result.message);
        }
      }

      if (typeof callback === 'function') {
        callback(result);
      }
    });

    socket.on('message:get', async (data, callback) => {
      if (!socket.user) {
        return callback({ success: false, message: 'Authentication required' });
      }

      const result = await messageController.getMessages(
        data.room || 'global',
        data.limit,
        data.page
      );
      if (typeof callback === 'function') {
        callback(result);
      }
    });

    socket.on('message:read', async (data, callback) => {
      if (!socket.user) {
        return callback({ success: false, message: 'Authentication required' });
      }

      const result = await messageController.markAsRead(data.messageId, socket.userId);

      if (result.success) {
        io.to(data.room || 'global').emit('message:read', {
          messageId: data.messageId,
          userId: socket.userId,
        });
      }

      if (typeof callback === 'function') {
        callback(result);
      }
    });

    socket.on('message:reaction', async (data, callback) => {
      if (!socket.user) {
        return callback({ success: false, message: 'Authentication required' });
      }

      const result = await messageController.addReaction(
        data.messageId,
        socket.userId,
        data.emoji
      );

      if (result.success) {
        io.to(data.room || 'global').emit('message:reaction:update', {
          messageId: data.messageId,
          reactions: result.message.reactions,
        });
      }

      if (typeof callback === 'function') {
        callback(result);
      }
    });

    // === TYPING EVENTS ===
    socket.on('typing:start', (data) => {
      const room = data.room || 'global';
      const typingKey = `${room}:${socket.userId}`;
      
      if (!typingUsers.has(typingKey)) {
        typingUsers.set(typingKey, {
          userId: socket.userId,
          username: socket.user.username,
          room,
        });
        
        socket.to(room).emit('typing:user', {
          userId: socket.userId,
          username: socket.user.username,
          isTyping: true,
        });
      }
    });

    socket.on('typing:stop', (data) => {
      const room = data.room || 'global';
      const typingKey = `${room}:${socket.userId}`;
      
      if (typingUsers.has(typingKey)) {
        typingUsers.delete(typingKey);
        
        socket.to(room).emit('typing:user', {
          userId: socket.userId,
          username: socket.user.username,
          isTyping: false,
        });
      }
    });

    // === ROOM EVENTS ===
    socket.on('room:create', async (data, callback) => {
      if (!socket.user) {
        return callback({ success: false, message: 'Authentication required' });
      }

      const result = await roomController.createRoom(data, socket.userId);

      if (result.success) {
        socket.join(result.room.name);
        io.emit('room:created', result.room);
      }

      if (typeof callback === 'function') {
        callback(result);
      }
    });

    socket.on('room:get', async (callback) => {
      const result = await roomController.getRooms();
      if (typeof callback === 'function') {
        callback(result);
      }
    });

    socket.on('room:join', async (data, callback) => {
      if (!socket.user) {
        return callback({ success: false, message: 'Authentication required' });
      }

      const result = await roomController.joinRoom(data.roomId, socket.userId);

      if (result.success) {
        socket.join(result.room.name);

        io.to(result.room.name).emit('room:user:joined', {
          userId: socket.userId,
          username: socket.user.username,
          avatar: socket.user.avatar,
          room: result.room.name,
        });
      }

      if (typeof callback === 'function') {
        callback(result);
      }
    });

    // === DISCONNECT EVENT ===
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.user ? socket.user.username : 'Anonymous'}`);

      if (socket.user) {
        userSockets.delete(socket.userId);

        // Clear typing status
        for (const [key, value] of typingUsers.entries()) {
          if (value.userId === socket.userId) {
            typingUsers.delete(key);
            socket.to(value.room).emit('typing:user', {
              userId: socket.userId,
              username: socket.user.username,
              isTyping: false,
            });
          }
        }

        // Update user status
        await User.findByIdAndUpdate(socket.userId, {
          status: 'offline',
          lastSeen: new Date(),
        });

        socket.broadcast.emit('user:offline', {
          userId: socket.userId,
          username: socket.user.username,
        });

        emitOnlineUsers(io);
      }
    });
  });

  // Helper function to emit online users
  function emitOnlineUsers(io) {
    User.find({ status: 'online' })
      .select('username avatar status')
      .then((users) => {
        io.emit('users:online', users);
      });
  }
};
