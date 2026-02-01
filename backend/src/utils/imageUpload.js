import cloudinary from '../config/cloudinary.js';

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} fileBuffer - Image file buffer from multer
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<string>} - Secure URL of uploaded image
 */
const uploadToCloudinary = (fileBuffer, folder = 'profit-tracker') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export default uploadToCloudinary;
