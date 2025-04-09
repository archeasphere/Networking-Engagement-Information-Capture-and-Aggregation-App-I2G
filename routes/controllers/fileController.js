const pool = require('../db');

const uploadFile = async (req, res) => {
    const { user_id, file_name, file_type, file_size, file_url } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO file_metadata (user_id, file_name, file_type, file_size, file_url)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [user_id, file_name, file_type, file_size, file_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getUserFiles = async (req, res) => {
    const userId = req.params.user_id;
    try {
        const result = await pool.query(
            'SELECT * FROM user_uploaded_files WHERE user_id = $1',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { uploadFile, getUserFiles };