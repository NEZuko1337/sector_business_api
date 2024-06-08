const express = require('express');
const { updateUser, getUser, getUsers, uploadPhoto } = require('../controllers/userController');

const router = express.Router();

router.put('/:id', uploadPhoto, updateUser);
router.get('/:id', getUser);
router.get('/', getUsers);

module.exports = router;
