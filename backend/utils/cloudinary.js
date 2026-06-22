const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary using credentials from environment
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file buffer directly to Cloudinary using upload_stream.
 * This is optimized for ephemeral container environments (e.g. Render/Vercel)
 * since it keeps files in memory buffers instead of writing to local disk.
 * 
 * @param {Buffer} fileBuffer - The memory buffer of the file.
 * @param {String} folder - The target folder inside Cloudinary (e.g., 'farmer_verifications').
 * @returns {Promise<String>} - Resolves to the uploaded file's secure URL.
 */
const uploadToCloudinary = (fileBuffer, folder = 'farmerdirect') => {
    return new Promise((resolve, reject) => {
        // Fallback for local testing if Cloudinary is not configured
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.warn('⚠️ [CLOUDINARY] Credentials missing in .env. Falling back to mock URL for testing.');
            // Generate a fake but plausible URL
            const randomId = Math.random().toString(36).substring(7);
            return resolve(`https://res.cloudinary.com/demo/image/upload/v1234567890/mock_${folder}_${randomId}.png`);
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: folder, resource_type: 'auto' },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload stream error:', error);
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );

        uploadStream.end(fileBuffer);
    });
};

module.exports = { uploadToCloudinary };
