// src/services/uploadService.js
const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');
const ApiError = require('../utils/apiError');

// Configure Cloudinary (values from .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Always use HTTPS
});

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  logger.warn('Cloudinary credentials missing in environment variables. Uploads will fail.');
}

/**
 * Upload image to Cloudinary
 * @param {string|Buffer} filePath - Local path or buffer
 * @param {object} options
 *   - folder: Cloudinary folder (e.g., 'products', 'stores', 'profiles')
 *   - public_id: Optional custom filename
 *   - transformation: Array of transformations (optional)
 * @returns {Promise<object>} Cloudinary response
 */
const uploadImage = async (filePath, options = {}) => {
  const {
    folder = 'general',
    public_id = null,
    transformation = [
      { quality: 'auto' },
      { fetch_format: 'auto' },
      { width: 1200, height: 1200, crop: 'limit' }, // Prevent oversized uploads
    ],
  } = options;

  try {
    const uploadOptions = {
      folder: `organic_marketplace/${folder}`,
      resource_type: 'image',
      overwrite: true,
      transformation,
    };

    if (public_id) {
      uploadOptions.public_id = public_id;
    }

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    logger.info('Image uploaded to Cloudinary', {
      public_id: result.public_id,
      url: result.secure_url,
      size: result.bytes,
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    logger.error('Cloudinary upload failed', {
      error: error.message,
      http_code: error.http_code,
    });

    if (error.http_code === 401) {
      throw ApiError.Unauthorized('Cloudinary authentication failed');
    }

    throw ApiError.Internal('Failed to upload image. Please try again.');
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      logger.info('Image deleted from Cloudinary', { publicId });
      return true;
    }

    if (result.result === 'not found') {
      logger.warn('Image not found on Cloudinary', { publicId });
      return false;
    }

    throw new Error(result.result);
  } catch (error) {
    logger.error('Failed to delete image from Cloudinary', {
      publicId,
      error: error.message,
    });
    throw ApiError.Internal('Failed to delete image');
  }
};

/**
 * Generate thumbnail URL (on-the-fly via Cloudinary)
 * @param {string} publicId
 * @param {number} width
 * @param {number} height
 * @returns {string} URL
 */
const getThumbnailUrl = (publicId, width = 300, height = 300) => {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { width, height, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
    ],
  });
};

/**
 * Generate optimized image URL with custom transformations
 */
const getOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
      options,
    ],
  });
};

module.exports = {
  uploadImage,
  deleteImage,
  getThumbnailUrl,
  getOptimizedUrl,
};