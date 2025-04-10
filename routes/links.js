const express = require('express');
const router = express.Router();
const { linkFiles, getUserLinkedFiles } = require('../controllers/linkController');
const pool = require('../db');
const authenticateToken = require('../middleware/auth'); // 🔐 Import the auth middleware

// ✅ Protected route: get links for the logged-in user
router.get('/my-links', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'SELECT * FROM links WHERE created_by = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('❌ Failed to fetch user links:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch links' });
  }
});

// ✅ Unprotected: get links by user_id (legacy/optional)
router.get('/:user_id', getUserLinkedFiles);

// ✅ Unprotected: create new link (you can protect this too)
router.post('/', linkFiles);

module.exports = router;
