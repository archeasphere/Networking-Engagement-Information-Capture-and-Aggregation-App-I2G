const express = require('express');
const router = express.Router();
const { uploadFile, getUserFiles } = require('../controllers/fileController');

router.post('/upload', uploadFile);
router.get('/:user_id', getUserFiles);

module.exports = router;