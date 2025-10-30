const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

exports.register = async (data) => {
  try {
    const { username, email, password } = data;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return { success: false, message: 'User already exists' };
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    });

    const token = generateToken(user._id);

    return {
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

exports.login = async (data) => {
  try {
    const { email, password } = data;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Update status
    user.status = 'online';
    await user.save();

    const token = generateToken(user._id);

    return {
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
      },
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
