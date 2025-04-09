const CLOUD_NAME = 'dhwd6gwka';
const UPLOAD_PRESET = 'ml_default';

export const uploadToCloudinary = async (file) => {
  try {
    // Manually generated signature, timestamp, and API key
    const signature = '33f63c7d032607568b1d365110edf73d01e979d3'; // Replace with the SHA-1 hash you generated
    const timestamp = 1735590487; // Replace with the timestamp you used
    const apiKey = 'your_api_key'; // Replace with your Cloudinary API key

    console.log("Using manually generated signature:", { signature, timestamp, apiKey });

    const formData = new FormData();

    let fileData;
    if (file.uri.startsWith('data:')) {
      const base64String = file.uri.split(',')[1];
      const mimeType = file.mimeType || file.type || 'application/octet-stream';
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      fileData = new Blob([byteArray], { type: mimeType });
    } else {
      const normalizedUri = Platform.OS === 'android' ? file.uri : file.uri.replace('file://', '');
      fileData = {
        uri: normalizedUri,
        name: file.name || 'upload',
        type: file.mimeType || file.type || 'application/octet-stream',
      };
    }

    formData.append('file', fileData, file.name || 'upload');
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('upload_preset', UPLOAD_PRESET);

    console.log("Uploading to Cloudinary with signature:", { apiKey, timestamp, signature });

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error response:', errorData);
      throw new Error(`Upload failed with status ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log("Cloudinary upload successful:", data);
    return data.secure_url;
  } catch (err) {
    console.error('Upload error:', err);
    throw err;
  }
};

// New function to upload a .txt file to Cloudinary
export const uploadTxtFileToCloudinary = async (connectionName, fileContent) => {
  try {
    console.log('Creating .txt file for connection:', connectionName);

    // Create a Blob for the .txt file
    const txtFile = new Blob([fileContent], { type: 'text/plain' });

    // Create a FormData object to upload the file
    const formData = new FormData();
    formData.append('file', txtFile, `${connectionName}.txt`);
    formData.append('upload_preset', UPLOAD_PRESET);

    // Upload the file to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload failed:', errorText);
      throw new Error('Failed to upload .txt file to Cloudinary');
    }

    const data = await response.json();
    console.log('Cloudinary response:', data);
    return data.secure_url; // Return the URL of the uploaded file
  } catch (error) {
    console.error('Error uploading .txt file to Cloudinary:', error);
    throw error;
  }
};