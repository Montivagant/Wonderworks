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
export const isValidDataUrl = (dataUrl: string | undefined): boolean => {
  if (!dataUrl) return false;
  return dataUrl.startsWith('data:image/');
};

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
export const processImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (isValidDataUrl(reader.result)) {
          // Debug the processed image
          debugImage('Processed Image', reader.result);
          resolve(reader.result);
        } else {
          console.error('Invalid data URL format:', reader.result.substring(0, 30) + '...');
          reject(new Error('Invalid image format'));
        }
      } else {
        reject(new Error('FileReader did not return a string'));
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(new Error('Error reading file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Gets a fallback image URL if the provided URL is invalid
 * @param {string} imageUrl - The image URL to check
 * @param {string} fallbackUrl - The fallback URL to use
 * @returns {string} - Either the original URL if valid or the fallback
 */
export const getImageWithFallback = (
  imageUrl: string | undefined, 
  fallbackUrl: string = '/placeholder.svg'
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
export const sanitizeImageUrl = (imageUrl?: string): string | undefined => {
  if (!imageUrl) return undefined;
  
  // If it's already a valid data URL, return as is
  if (isValidDataUrl(imageUrl)) {
    return imageUrl;
  }
  
  // If it's a relative URL, return as is
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }
  
  // If it's an absolute URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Try to fix common issues with data URLs
  if (imageUrl.includes('data:image')) {
    // Extract the data part and try to rebuild the URL
    const parts = imageUrl.split(',');
    if (parts.length >= 2) {
      const dataPart = parts[parts.length - 1];
      return `data:image/jpeg;base64,${dataPart}`;
    }
  }
  
  // If we can't fix it, return undefined
  return undefined;
};

/**
 * Resizes an image data URL to the specified dimensions
 * @param {string} dataUrl - The data URL to resize
 * @param {number} maxWidth - The maximum width
 * @param {number} maxHeight - The maximum height
 * @returns {Promise<string>} - A promise that resolves to the resized data URL
 */
export const resizeImage = (
  dataUrl: string, 
  maxWidth: number = 800, 
  maxHeight: number = 800
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