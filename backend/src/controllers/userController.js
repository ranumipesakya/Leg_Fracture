const User = require('../models/User');

function formatUser(user) {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || '',
    gender: user.gender || '',
    dob: user.dob || '',
    avatar: user.avatar || '',
    lastLogin: user.lastLogin || null,
    initials: `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase(),
  };
}

async function updateMe(req, res) {
  try {
    const allowedFields = ['firstName', 'lastName', 'phone', 'gender', 'dob', 'avatar'];
    const updates = {};

    for (const key of allowedFields) {
      if (key in req.body) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    return res.status(200).json({ user: formatUser(user) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

module.exports = { updateMe };
