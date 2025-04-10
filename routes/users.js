const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { email, password, username } = req.body;
  
    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Email, password, and username are required' });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, created_at)
         VALUES ($1, $2, $3, NOW()) RETURNING id, username, email`,
        [username, email, hashedPassword]
      );
  
      res.status(201).json({ message: 'Account created', user: result.rows[0] });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Failed to create account' });
    }
  });
  

