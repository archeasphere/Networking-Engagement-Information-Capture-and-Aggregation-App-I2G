const express = require('express');
const router = express.Router();
const { uploadFile, getUserFiles } = require('../controllers/fileController');
const verifyToken = require('../middleware/auth');
const pool = require('../db');

router.get('/', (req, res) => res.send('📦 File route is live!'));

router.get('/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM file_metadata ORDER BY uploaded_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/upload', verifyToken, uploadFile); // ✅ now protected by JWT
router.get('/:user_id', getUserFiles);

module.exports = router;