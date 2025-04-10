const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, created_at) VALUES ($1, $2, NOW()) RETURNING id, email',
      [email, hashedPassword]
    );

    res.status(201).json({ message: 'Account created', user: result.rows[0] });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Failed to create account' });
  }
});

module.exports = router;

