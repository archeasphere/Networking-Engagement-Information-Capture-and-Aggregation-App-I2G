import React, { useEffect, useState } from "react";
import { fetchData, postData } from "./api";

function App() {
  const [dbData, setDbData] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState("");

  // ✅ Fetch database connection test
  useEffect(() => {
    fetchData("/test-db")
      .then(response => setDbData(response))
      .catch(error => console.error("Error fetching database:", error));
  }, []);

  // ✅ Handle file upload to Cloudinary
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await postData("/upload", formData);
      setUploadedUrl(response.file_url);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed!");
    }
  };

  return (
    <div>
      <h1>React + Render API Test</h1>

      {/* ✅ Display database connection test result */}
      <h2>Database Test</h2>
      {dbData ? <p>Database Time: {dbData.time}</p> : <p>Loading...</p>}

      {/* ✅ File Upload Section */}
      <h2>Upload File</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>

      {/* ✅ Show uploaded file URL */}
      {uploadedUrl && (
        <p>
          File Uploaded: <a href={uploadedUrl} target="_blank" rel="noreferrer">{uploadedUrl}</a>
        </p>
      )}
    </div>
  );
}

export default App;
