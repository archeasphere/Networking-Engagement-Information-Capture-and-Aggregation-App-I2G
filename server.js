require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');  // ✅ Only declare Pool here

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Define the database connection once
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false  // Required for Render-hosted databases
    }
});

// ✅ Test Route to Check Database Connection
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() AS current_time'); // Simple test query
        res.json({ message: "Database connected!", time: result.rows[0].current_time });
    } catch (err) {
        console.error("❌ Error querying the database:", err);
        res.status(500).json({ error: "Database query failed" });
    }
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
