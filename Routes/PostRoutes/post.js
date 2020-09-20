const express = require('express');
const router = express.Router();
const auth = require('../../Middleware/Auth');
const Users = require('../../Modals/user');
const Posts = require('../../Modals/post');
const { check, validationResult } = require('express-validator');

//private route
//POST create post
router.post(
  '/createpost',
  [
    auth,
    check('title', 'title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const newPost = new Posts({
        title: req.body.title,
        description: req.body.description,
        author: req.user.id,
        imgURL: req.body.imgURL,
        tags: req.body.tags,
        location: req.body.location,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('server Error');
    }
  }
);
router.get('/allposts', async (req, res) => {
  try {
    const posts = await Posts.find({}).sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server Error');
  }
});

//delete my post
router.delete('/deletepost/:id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    //check if post exists
    if (!post) {
      return res.status(404).send({ msg: 'post not found' });
    }
    //check if the post belongs to user or not

    if (post.author.toString() != req.user.id) {
      return res.status(401).json({ msg: 'User not Authorized' });
    }
    await post.remove();
    res.json('Post removed');
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'post not found' });
    }
    res.status(500).send('Server error');
  }
});

//get my posts
router.get('/myposts', auth, async (req, res) => {
  try {
    const myPosts = await Posts.find({ author: req.user.id });
    if (!myPosts) {
      return res.status(400).json({ msg: '0 posts available' });
    }
    res.json(myPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server Error');
  }
});
//upvote a post
router.put('/upvote/:id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    //check if the post has already been liked
    if (
      post.downvotes.filter(
        downvote => downvote.user.toString() === req.user.id
      ).length > 0
    ) {
      const removeIndex = post.downvotes
        .map(dislike => dislike.user.toString())
        .indexOf(req.user.id);

      post.downvotes.splice(removeIndex, 1);
      await post.save();
    }
    if (
      post.upvotes.filter(upvote => upvote.user.toString() === req.user.id)
        .length > 0
    ) {
      const removeIndex = post.upvotes
        .map(like => like.user.toString())
        .indexOf(req.user.id);
        post.upvotes.splice(removeIndex, 1);
      await post.save();
      return res.json(post.upvotes);
    }
    //if post has not been liked yet
    post.upvotes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.upvotes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

//downvote a post
router.put('/downvote/:id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    //check if the post has already been liked
    if (
      post.upvotes.filter(upvote => upvote.user.toString() === req.user.id)
        .length > 0
    ) {
      const removeIndex = post.upvotes
        .map(like => like.user.toString())
        .indexOf(req.user.id);

      post.upvotes.splice(removeIndex, 1);
      await post.save();
    }
    if (
      post.downvotes.filter(
        downvote => downvote.user.toString() === req.user.id
      ).length > 0
    ) {
      const removeIndex = post.downvotes
        .map(dislike => dislike.user.toString())
        .indexOf(req.user.id);

      post.downvotes.splice(removeIndex, 1);
      await post.save();
      return res.json(post.downvotes);
    }
    //if post has not been liked yet
    post.downvotes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.downvotes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

//flag a post
router.put('/flag/:id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    //check if its already flagged
    if (
      post.flags.filter(flag => flag.user.toString() === req.user.id).length > 0
    ) {
      const removeIndex = post.flags
        .map(flag => flag.user.toString())
        .indexOf(req.user.id);

      post.flags.splice(removeIndex, 1);
      await post.save();
      return res.json(post.flags);
    }
    //if post has not been liked yet
    post.flags.unshift({ user: req.user.id });
    await post.save();
    res.json(post.flags);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

//get post by id
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) {
      return res.status(404).send({ msg: 'post details not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server Error');
  }
});

//get posts by location


module.exports = router;
