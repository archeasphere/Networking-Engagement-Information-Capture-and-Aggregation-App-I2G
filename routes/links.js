const express = require('express');
const router = express.Router();
const { linkFiles, getUserLinkedFiles } = require('../controllers/linkController');

router.post('/', linkFiles);
router.get('/:user_id', getUserLinkedFiles);

module.exports = router;
