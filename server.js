require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("./cloudinaryConfig");
const streamifier = require("streamifier");
const pool = require('./db');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//const authroutes = require('./app/routes/auth');  // ✅ Correct import path

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS to allow frontend to access the API
app.use(cors());
app.use(express.json()); // Support JSON requests

//app.use('/auth', authroutes);

// Test Route to Check Database Connection
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() AS current_time'); // Simple test query
        res.json({ message: "✅ Database connected!", time: result.rows[0].current_time });
    } catch (err) {
        console.error("❌ Error querying the database:", err);
        res.status(500).json({ error: "Database query failed" });
    }
});

// Test Route to Check Server & Cloudinary Connection
app.get("/", (req, res) => {
    res.send("🚀 Cloudinary & Database API is running!");
});


const upload = multer(); // ← THIS is what you're missing

// Upload Route (Handles File Uploads to Cloudinary)
app.post("/upload", upload.single("file"), async (req, res) => {
    const userId = 1; // Replace this with the actual authenticated user ID (e.g., from token)
  
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
  
    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    const fileType = req.file.mimetype;
    const fileSize = req.file.size;
  
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: "my_project_files" },
      async (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
  
        try {
          await pool.query(
            `INSERT INTO file_metadata (user_id, file_name, file_type, file_size, file_url, uploaded_at)
             VALUES ($1, $2, $3, $4, $5, NOW());`,
            [userId, originalName, fileType, fileSize, result.secure_url]
          );
  
          res.json({
            name: originalName,
            type: fileType,
            size: fileSize,
            url: result.secure_url,
          });
        } catch (dbError) {
          console.error("DB Save Error:", dbError);
          res.status(500).json({ error: "Failed to save file metadata" });
        }
      }
    );
  
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
  

// Endpoint to create a new account
app.post('/create-account', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, username, email, created_at',
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'Account created successfully', user: result.rows[0] });

    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Retrieve the user from the database
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Compare the password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate a JWT
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API Route to Fetch All Uploaded Files from Database
app.get("/files", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM files ORDER BY uploaded_at DESC;");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Error fetching files:", err);
        res.status(500).json({ error: "Failed to fetch files" });
    }
});

// Route to Save Uploaded File Info to Database
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

// Start Server (Only Once!)
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});