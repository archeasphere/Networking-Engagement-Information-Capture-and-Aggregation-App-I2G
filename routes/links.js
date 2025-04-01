const express = require('express');
const router = express.Router();
const { linkFiles, getUserLinkedFiles } = require('../controllers/linkController');
const verifyToken = require('../middleware/auth'); // ✅ Add this!

router.post('/', verifyToken, linkFiles); // ✅ Protected
router.get('/:user_id', getUserLinkedFiles); // public for now

module.exports = router;
