require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("./cloudinaryConfig");
const streamifier = require("streamifier");
const pool = require('./db');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userRoutes = require('./routes/users');
const fileRoutes = require('./routes/files');
const linkRoutes = require('./routes/links');

//const authroutes = require('./app/routes/auth');  // ✅ Correct import path
const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS to allow frontend to access the API
app.use(cors());
app.use(express.json()); // Support JSON requests

// Mount modular API routes
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/links', linkRoutes);

// 🧪 Test Route - Database
app.get('/test-db', async (req, res) => {
    console.log("✅ /test-db route was called");
  
    try {
      const result = await pool.query('SELECT NOW() AS current_time');
      console.log("✅ Query succeeded:", result.rows);
      res.json({ message: "✅ Database connected!", time: result.rows[0].current_time });
    } catch (err) {
      console.error("❌ Error querying the database:", err);
      res.status(500).json({ error: "Database query failed", details: err.message });
    }
  });
  

// 🧪 Test Route - Cloudinary + Server
app.get("/", (req, res) => {
    res.send("🚀 Cloudinary & Database API is running!");
});

// ⚙️ Multer setup
const upload = multer();

// ☁️ Upload File to Cloudinary + Save Metadata
app.post("/upload", upload.single("file"), async (req, res) => {
    const userId = 1; // TODO: Replace with user from JWT in production

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

// 🧾 Create New Account
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

// 🔐 Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/ping', (req, res) => {
    res.send('pong');
  });
  

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});