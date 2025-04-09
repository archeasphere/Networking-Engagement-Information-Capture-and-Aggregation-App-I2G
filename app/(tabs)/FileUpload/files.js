export const sendFileMetadata = async (file, fileUrl, token) => {
    const res = await fetch('https://your-backend.onrender.com/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: fileUrl,
      }),
    });
  
    return res.json();
  };
  