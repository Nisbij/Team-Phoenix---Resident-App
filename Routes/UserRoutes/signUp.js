const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Users = require('../../Modals/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const UserController = require('../../Controllers/UserController');

//route to sign-up

router.post(
  '/',
  [
    check('name', 'Please include a Valid name').isLength({
      min: 3,
    }),
    check('username', 'please include a valid name').not().isEmpty(),
    check('email', 'please enter a valid email').isEmail(),
    check(
      'password',
      'please enter a passowrd with 8 or more characters'
    ).isLength({ min: 8 }),
  ],
  UserController.SignUp
);

module.exports = router;
