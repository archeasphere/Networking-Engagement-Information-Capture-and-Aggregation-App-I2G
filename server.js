require("dotenv").config();
const express = require("express");
const cors = require("cors"); // ✅ Added CORS for frontend connection
const { Pool } = require("pg");
const multer = require("multer");
const cloudinary = require("./cloudinaryConfig"); // Import Cloudinary config
const streamifier = require("streamifier");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Enable CORS to allow frontend to access the API
app.use(cors());
app.use(express.json()); // ✅ Support JSON requests

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
        res.json({ message: "✅ Database connected!", time: result.rows[0].current_time });
    } catch (err) {
        console.error("❌ Error querying the database:", err);
        res.status(500).json({ error: "Database query failed" });
    }
});

// ✅ Test Route to Check Server & Cloudinary Connection
app.get("/", (req, res) => {
    res.send("🚀 Cloudinary & Database API is running!");
});

// ✅ Upload Route (Handles File Uploads to Cloudinary)
const upload = multer();
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

// ✅ API Route to Fetch All Uploaded Files from Database
app.get("/files", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM files ORDER BY uploaded_at DESC;");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error fetching files:", err);
        res.status(500).json({ error: "Failed to fetch files" });
    }
});

// ✅ Route to Save Uploaded File Info to Database
app.post("/save-file", async (req, res) => {
    const { file_url, file_name } = req.body;
    if (!file_url || !file_name) {
        return res.status(400).json({ error: "Missing file data" });
    }

    try {
        await pool.query(
            "INSERT INTO files (file_name, file_url, uploaded_at) VALUES ($1, $2, NOW());",
            [file_name, file_url]
        );
        res.json({ message: "✅ File saved successfully!" });
    } catch (err) {
        console.error("❌ Error saving file:", err);
        res.status(500).json({ error: "Failed to save file" });
    }
});

// ✅ Start Server (Only Once!)
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
