const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // Import path module to serve static files

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the 'uploads' folder publicly for images
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

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
  following: { type: [String], default: [] }, // Array of usernames the user is following
  followers: { type: [String], default: [] }, // Array of usernames following this user
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

// Route to fetch user profile data along with followers and following usernames
app.get('/profile/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ name: username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch usernames of followers and following
    const followers = await User.find({ name: { $in: user.followers } }, 'name');
    const following = await User.find({ name: { $in: user.following } }, 'name');

    res.status(200).json({
      username: user.name,
      bio: user.bio,
      profilePic: user.profilePic ? `http://localhost:${PORT}/${user.profilePic}` : null,
      followers: followers.map(f => f.name), // List of follower usernames
      following: following.map(f => f.name), // List of following usernames
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Route to fetch posts by user
app.get('/user-posts/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const posts = await Post.find({ username });

    res.status(200).json(posts);
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

// Route to delete a specific post
app.delete('/posts/:postId', async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findByIdAndDelete(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Route to update user profile (bio and profile picture)
app.put('/edit-profile/:username', upload.single('profilePic'), async (req, res) => {
  const { username } = req.params;
  const { bio } = req.body;
  
  try {
    const updateData = { bio };

    // If a new profile picture is uploaded, update the profilePic field
    if (req.file) {
      updateData.profilePic = req.file.path;
    }

    const updatedUser = await User.findOneAndUpdate({ name: username }, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/all-posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to unlike a post
app.post('/unlike-post/:postId', async (req, res) => {
  const { username } = req.body;
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);

    if (post.likes.includes(username)) {
      post.likes = post.likes.filter((user) => user !== username);
      await post.save();
      res.status(200).json({ message: 'Post unliked successfully', likes: post.likes });
    } else {
      res.status(400).json({ message: 'You have not liked this post' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to follow a user
app.post('/follow/:username', async (req, res) => {
  const { currentUser } = req.body; // User who is following
  const { username } = req.params; // User to be followed

  try {
    const userToFollow = await User.findOne({ name: username });
    const followingUser = await User.findOne({ name: currentUser });

    if (!userToFollow || !followingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent following self
    if (currentUser === username) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    // Check if already following
    if (followingUser.following.includes(username)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Update followers and following lists
    followingUser.following.push(username);
    userToFollow.followers.push(currentUser);
    await followingUser.save();
    await userToFollow.save();

    res.status(200).json({ message: 'Followed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Route to unfollow a user
app.post('/unfollow/:username', async (req, res) => {
  const { currentUser } = req.body; // User who is unfollowing
  const { username } = req.params; // User to be unfollowed

  try {
    // Remove from following
    await User.updateOne({ name: currentUser }, { $pull: { following: username } });
    // Remove from followers of the user being unfollowed
    await User.updateOne({ name: username }, { $pull: { followers: currentUser } });

    res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get user followers and following count
app.get('/follow-count/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ name: username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      followingCount: user.following.length,
      followersCount: user.followers.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

