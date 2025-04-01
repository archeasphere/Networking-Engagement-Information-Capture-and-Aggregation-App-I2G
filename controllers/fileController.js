const pool = require('../db');

const uploadFile = async (req, res) => {
  const userId = req.user.userId;
  const { file_name, file_type, file_size, file_url } = req.body;

  if (!file_name || !file_type || !file_size || !file_url) {
    return res.status(400).json({ error: 'Missing file metadata' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO file_metadata (user_id, file_name, file_type, file_size, file_url, uploaded_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [userId, file_name, file_type, file_size, file_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getUserFiles = async (req, res) => {
  const userId = req.params.user_id;

  try {
    const result = await pool.query(
      'SELECT * FROM file_metadata WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  uploadFile,
  getUserFiles
};
