const pool = require('../db');

const linkFiles = async (req, res) => {
    const { original_file, linked_file, created_by } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO file_links (original_file, linked_file, created_by)
             VALUES ($1, $2, $3) RETURNING *`,
            [original_file, linked_file, created_by]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getUserLinkedFiles = async (req, res) => {
    const userId = req.params.user_id;
    try {
        const result = await pool.query(
            'SELECT * FROM user_linked_files WHERE user_id = $1',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { linkFiles, getUserLinkedFiles };
