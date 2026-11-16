const express = require('express');
const { body } = require('express-validator');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const postRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
];

// Anyone can read
router.get('/', async (req, res) => {
  const posts = await Post.find().populate('author', 'name').sort({ createdAt: -1 });
  res.json(posts);
});

router.get('/:id', async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'name');
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
});

// Logged-in users can create
router.post('/', auth, postRules, validate, async (req, res) => {
  const post = await Post.create({
    title: req.body.title,
    content: req.body.content,
    author: req.userId,
  });
  res.status(201).json(post);
});

// Only the author can edit
router.put('/:id', auth, postRules, validate, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.author.toString() !== req.userId) {
    return res.status(403).json({ message: 'Not allowed: you are not the author' });
  }
  post.title = req.body.title;
  post.content = req.body.content;
  await post.save();
  res.json(post);
});

// Only the author can delete
router.delete('/:id', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.author.toString() !== req.userId) {
    return res.status(403).json({ message: 'Not allowed: you are not the author' });
  }
  await post.deleteOne();
  res.json({ message: 'Post deleted' });
});

module.exports = router;