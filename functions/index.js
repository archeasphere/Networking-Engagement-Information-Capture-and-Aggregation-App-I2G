/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

<<<<<<< HEAD
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
=======
const functions = require("firebase-functions");
const {Pool} = require("pg");

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: "postgres://youruser:yourpassword@your-remote-host:5432/yourdatabase",
  ssl: {rejectUnauthorized: false},
});

// Firebase Function to Fetch Data from PostgreSQL
exports.getFiles = functions.https.onRequest(async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM files");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({error: "Internal Server Error"});
  }
});
>>>>>>> d3759f0 (Initial commit - Added Firebase functions and config files)
