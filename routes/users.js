const express = require('express');
const passport = require('passport');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');

router.route('/register')
.get( users.registerrender)
.post(catchAsync(users.register));

router.route('/login')
.get(users.loginRender)
.post(passport.authenticate('local',{ failureFlash: true, failureRedirect:'/login'}), users.login);

router.get('/logout', users.Logout); 
module.exports = router;