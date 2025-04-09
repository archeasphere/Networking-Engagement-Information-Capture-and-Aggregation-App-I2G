import { uploadToCloudinary } from '../FileUpload/cloudinary';
import { sendFileMetadata } from '../FileUpload/files';

const UploadForm = () => {
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    const token = localStorage.getItem('token');

    const url = await uploadToCloudinary(file);
    const result = await sendFileMetadata(file, url, token);

    console.log(result);
  };

  return <input type="file" onChange={handleFileChange} />;
};

export default UploadForm;
