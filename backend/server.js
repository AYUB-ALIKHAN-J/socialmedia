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

// Multer setup for file uploads (handling profile pictures and post images)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store files in 'uploads/' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Use timestamp for file names
  },
});

const upload = multer({ storage }); // Initialize multer with the storage settings

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

// Post Schema
const postSchema = new mongoose.Schema({
  username: { type: String, required: true },
  caption: { type: String, required: true },
  postImage: { type: String, required: true },
  likes: { type: [String], default: [] }, // Store usernames of users who liked the post
  comments: [
    {
      username: String,
      comment: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Post = mongoose.model('Post', postSchema);

// Route to handle user signup
app.post('/receive-data', upload.single('profilePic'), async (req, res) => {
  const { name, pass, mail, bio } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ name }, { mail }] });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

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

// Route to create a new post
app.post('/create-post', upload.single('postImage'), async (req, res) => {
  const { username, caption } = req.body;

  try {
    const newPost = new Post({
      username,
      caption,
      postImage: req.file ? req.file.path : null, // Make sure the path is correct
    });

    await newPost.save();
    res.status(201).json({ message: 'Post created successfully' });
  } catch (error) {
    console.error('Error creating post:', error.message);
    res.status(500).json({ error: error.message }); // Improve error message visibility
  }
});

// Route to handle user login
app.post('/login', async (req, res) => {
  const { user, pass } = req.body;

  try {
    const existingUser = await User.findOne({ name: user });

    if (!existingUser) {
      return res.status(400).json({ message: 'Invalid user credentials' });
    }

    const isPasswordValid = await bcrypt.compare(pass, existingUser.pass);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to like a post
app.post('/like-post/:postId', async (req, res) => {
  const { username } = req.body;
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);

    if (!post.likes.includes(username)) {
      post.likes.push(username);
      await post.save();
      res.status(200).json({ message: 'Post liked successfully' });
    } else {
      res.status(400).json({ message: 'You have already liked this post' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Route to add a comment to a post
app.post('/comment-post/:postId', async (req, res) => {
  const { username, comment } = req.body;
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);

    post.comments.push({ username, comment });
    await post.save();

    res.status(200).json({ message: 'Comment added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
