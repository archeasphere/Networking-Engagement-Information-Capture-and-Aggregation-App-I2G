require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");  
const multer = require("multer");
const cloudinary = require("./cloudinaryConfig"); // Import Cloudinary config
const streamifier = require("streamifier");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Database Connection Setup
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

// ✅ Test Route to Check Cloudinary Connection
app.get("/", (req, res) => {
  res.send("🚀 Cloudinary Server is running!");
});

// ✅ Upload Route (Handles File Uploads to Cloudinary)
const upload = multer(); // Handle file uploads
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Upload file to Cloudinary
  let stream = cloudinary.uploader.upload_stream(
    { resource_type: "auto" },
    (error, result) => {
      if (error) return res.status(500).json({ error: error.message });

      res.json({ file_url: result.secure_url });
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(stream);
});

// ✅ Start Server (Only Once!)
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
