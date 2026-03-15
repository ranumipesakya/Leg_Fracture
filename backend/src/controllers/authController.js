const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function formatUser(user) {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || '',
    gender: user.gender || '',
    dob: user.dob || '',
    lastLogin: user.lastLogin || null,
    initials: `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase(),
  };
}

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

async function register(req, res) {
  try {
    const { firstName, lastName, email, phone, gender, dob, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Please fill required fields' });
    }

    const emailKey = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: emailKey });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: emailKey,
      phone: phone || '',
      gender: gender || '',
      dob: dob || '',
      password: hashedPassword,
      lastLogin: new Date(),
    });

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id.toString());
    setAuthCookie(res, token);

    return res.status(201).json({ user: formatUser(user) });
  } catch (error) {
    return res.status(500).json({ error: 'Server error during registration' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const emailKey = email.trim().toLowerCase();

    const user = await User.findOne({ email: emailKey });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user._id.toString());
    setAuthCookie(res, token);

    return res.status(200).json({ user: formatUser(user) });
  } catch (error) {
    return res.status(500).json({ error: 'Server error during login' });
  }
}

async function me(req, res) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(200).json(null);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(200).json(null);
    }

    return res.status(200).json(formatUser(user));
  } catch (error) {
    return res.status(200).json(null);
  }
}

async function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });

  return res.status(200).json({ ok: true });
}

module.exports = { register, login, me, logout };
