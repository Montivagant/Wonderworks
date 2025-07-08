/**
 * Image Utility Functions
 * 
 * This file contains utility functions for handling images in the WonderWorks application,
 * including validation, processing, and error handling for image uploads.
 */

/**
 * Validates if a string is a valid data URL
 * @param {string} dataUrl - The string to validate
 * @returns {boolean} - Whether the string is a valid data URL
 */
export function isValidDataUrl(url: string): boolean {
  if (!url) return false;
  
  const base64Regex = /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,/;
  return base64Regex.test(url);
}

/**
 * Debug function to log image information
 * @param {string} label - Label for the log
 * @param {string} imageUrl - The image URL to debug
 */
export const debugImage = (label: string, imageUrl?: string): void => {
  console.group(`Image Debug: ${label}`);
  console.log('Image URL exists:', !!imageUrl);
  if (imageUrl) {
    console.log('Image URL length:', imageUrl.length);
    console.log('Image URL starts with:', imageUrl.substring(0, 30) + '...');
    console.log('Is valid data URL:', isValidDataUrl(imageUrl));
    console.log('URL type:', imageUrl.split(';')[0]);
  }
  console.groupEnd();
};

/**
 * Processes an image file and returns a data URL
 * @param {File} file - The image file to process
 * @returns {Promise<string>} - A promise that resolves to the data URL
 */
export async function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      
      // Validate image type and size
      if (!dataUrl) {
        reject(new Error('Failed to read file'));
        return;
      }

      // Optional: Add image size validation
      const img = new Image();
      img.onload = () => {
        // Optional: Add size constraints if needed
        // if (img.width > 2000 || img.height > 2000) {
        //   reject(new Error('Image too large'));
        //   return;
        // }
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Invalid image'));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsDataURL(file);
  });
}

/**
 * Gets a fallback image URL if the provided URL is invalid
 * @param {string} imageUrl - The image URL to check
 * @param {string} fallbackUrl - The fallback URL to use
 * @returns {string} - Either the original URL if valid or the fallback
 */
export const getImageWithFallback = (
  imageUrl: string | undefined, 
  fallbackUrl = '/placeholder.svg'
): string => {
  // Debug the image URL
  debugImage('getImageWithFallback', imageUrl);
  
  if (!imageUrl) {
    return fallbackUrl;
  }
  
  // If it's a valid data URL, return it
  if (isValidDataUrl(imageUrl)) {
    return imageUrl;
  }
  
  // If it's a relative URL (starts with /), return it
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }
  
  // If it's an absolute URL (starts with http), return it
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If it's a base64 string without the data: prefix, try to fix it
  if (imageUrl.includes('base64,')) {
    const parts = imageUrl.split(',');
    if (parts.length >= 2) {
      const dataPart = parts[parts.length - 1];
      return `data:image/jpeg;base64,${dataPart}`;
    }
  }
  
  // If we can't determine the type, return the fallback
  return fallbackUrl;
};

/**
 * Ensures an image URL is properly formatted
 * @param {string} imageUrl - The image URL to sanitize
 * @returns {string | undefined} - A properly formatted image URL or undefined
 */
export function sanitizeImageUrl(url: string): string {
  // More strict validation
  if (!url || typeof url !== 'string') {
    // Don't log an error for null/undefined, just return empty string
    return '';
  }

  // Trim and remove any potential script tags or malicious content
  const sanitized = url.trim().replace(/<script.*?>.*?<\/script>/gi, '');

  // Validate base64 data URL or external URL
  const base64Regex = /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,/;
  const urlRegex = /^(https?:\/\/.*\.(png|jpe?g|gif|webp|svg))/i;
  const relativeUrlRegex = /^\/.*\.(png|jpe?g|gif|webp|svg)$/i;

  if (base64Regex.test(sanitized) || urlRegex.test(sanitized) || relativeUrlRegex.test(sanitized)) {
    return sanitized;
  }

  console.error('Invalid image format:', sanitized);
  return '';
}

/**
 * Resizes an image data URL to the specified dimensions
 * @param {string} dataUrl - The data URL to resize
 * @param {number} maxWidth - The maximum width
 * @param {number} maxHeight - The maximum height
 * @returns {Promise<string>} - A promise that resolves to the resized data URL
 */
export const resizeImage = (
  dataUrl: string, 
  maxWidth = 800, 
  maxHeight = 800
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!isValidDataUrl(dataUrl)) {
      reject(new Error('Invalid data URL'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round(height * maxWidth / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round(width * maxHeight / height);
          height = maxHeight;
        }
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Get the data URL from the canvas
      const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      resolve(resizedDataUrl);
    };
    
    img.onerror = () => {
      reject(new Error('Error loading image'));
    };
    
    img.src = dataUrl;
  });
}; 