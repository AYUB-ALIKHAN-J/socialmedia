const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  pass: { type: String, required: true },
  mail: { type: String, required: true, unique: true },
  bio: String,
  profilePic: String,
});

const User = mongoose.model('User', userSchema);

// Route to receive user data
app.post('/receive-data', upload.single('profilePic'), async (req, res) => {
  const { name, pass, mail, bio } = req.body;

  try {
    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ name }, { mail }] });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(pass, 10);

    const newUser = new User({
      name,
      pass: hashedPassword,
      mail,
      bio,
      profilePic: req.file ? req.file.path : null,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to handle user login
app.post('/login', async (req, res) => {
  const { user, pass } = req.body;

  try {
    // Find the user by username (name)
    const existingUser = await User.findOne({ name: user });

    if (!existingUser) {
      return res.status(400).json({ message: 'Invalid user credentials' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(pass, existingUser.pass);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Successful login
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
