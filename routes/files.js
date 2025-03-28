const express = require('express');
const router = express.Router();
const { uploadFile, getUserFiles } = require('../controllers/fileController');
const pool = require('../db'); // Required to use directly in this route

// ✅ Add this test route
router.get('/', (req, res) => {
  res.send('📦 File route is live!');
});

// ✅ Add this to list all files (for debug/testing)
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM file_metadata ORDER BY uploaded_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('❌ Failed to fetch all files:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Existing routes
router.post('/upload', uploadFile);
router.get('/:user_id', getUserFiles);

module.exports = router;
