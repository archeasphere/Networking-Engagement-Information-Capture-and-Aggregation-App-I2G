const express = require('express');
const router = express.Router();
const { uploadFile, getUserFiles } = require('../controllers/fileController');
const pool = require('../db');
const authenticateToken = require('../middleware/auth'); // 🔐 Import middleware

// ✅ Test route
router.get('/', (req, res) => {
  res.send('📦 File route is live!');
});

// ✅ Unprotected: All files (for debug/testing)
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM file_metadata ORDER BY uploaded_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('❌ Failed to fetch all files:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ 🔐 Protected: Return files for logged-in user
router.get('/my-files', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'SELECT * FROM file_metadata WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('❌ Failed to fetch user files:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Upload (could protect later if needed)
router.post('/upload', uploadFile);

// ✅ Legacy route (optional)
router.get('/:user_id', getUserFiles);

module.exports = router;
