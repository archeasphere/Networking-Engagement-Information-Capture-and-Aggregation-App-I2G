import axios from "axios";

const API_BASE_URL = "https://backend-service-ndyt.onrender.com";

// 🔁 Convert base64 → Blob
const base64ToBlob = (dataURI) => {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeString });
};

// ✅ Main uploader function
export const uploadFile = async (file) => {
  try {
    // 🔥 Convert base64 data URI → Blob → File
    const blob = base64ToBlob(file.uri);
    const realFile = new File([blob], file.name, { type: file.mimeType });

    const formData = new FormData();
    formData.append("file", realFile);

    console.log("📤 Uploading to backend:", `${API_BASE_URL}/upload`);
    console.log("📎 File:", realFile);

    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Upload success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Upload failed:", error.response?.data || error.message || error);
    throw error;
  }
};