const express = require('express');
const { check, validationResult } = require('express-validator');
const Users = require('../../Modals/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const router = express.Router();

router.post(
  '/',
  [
    check('googleID', 'Must include Google ID').not().isEmpty(),
    check('email', 'enter a valid email').isEmail(),
    check('username', 'enter Username').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, username, googleID } = req.body;

    try {
      var user = await Users.findOne({ googleID });
      if (user) {
        const payload = {
          user: {
            id: user.id,
          },
        };
        jwt.sign(
          payload,
          process.env.jwtSecret,
          {
            expiresIn: 1209600,
          },
          (err, token) => {
            if (err) {
              throw err;
            } else {
              console.log('user logged in ');
              res.json({ token });
            }
          }
        );
      } else {
        user = new Users({
          name: username,
          username: username,
          email: email,
          googleID: googleID,
        });
        await user.save();
        const payload = {
          user: {
            id: user.id,
          },
        };
        jwt.sign(
          payload,
          process.env.jwtSecret,
          {
            expiresIn: 1209600,
          },
          (err, token) => {
            if (err) {
              throw err;
            } else {
              res.json({ token });
            }
          }
        );
      }
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
