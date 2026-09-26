import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './model/User.js';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:4200', // replace with your frontend URL
  credentials: true 
})); // so that we can access the backend from the frontend
app.use(express.json()); // so that we can access the req.body in the backend
app.use(cookieParser()); // so that we can access the cookies in the backend

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:127.0.0.1:27017/loginApp";
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Register API
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, mobile, password: hashedPassword });
    return res.status(201).json({ status: 'success', message: 'User registered successfully', user: newUser });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Login API
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ status: 'error', message: 'User does not exist' });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ status: 'error', message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: existingUser._id, email: existingUser.email }, JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    return res.status(200).json({ status: 'success', message: 'Login successful', token });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

app.get("/api/user", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if(!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    return res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
    sameSite: 'strict'
  });
  return res.status(200).json({ status: 'success', message: 'Logout successful' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});