/**
 * Local image storage utility
 * This utility converts image files to data URLs for local storage
 */

/**
 * Convert a file to a data URL
 * @param file The file to convert
 * @returns A promise that resolves to the data URL
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to data URL'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Save an image locally by converting it to a data URL
 * @param file The image file to save
 * @returns An object with the data URL and image dimensions
 */
export const saveImageLocally = async (file: File) => {
  try {
    const dataUrl = await fileToDataUrl(file);
    
    // Create an image element to get dimensions
    const img = new Image();
    const dimensions = await new Promise<{width: number, height: number}>((resolve) => {
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      img.src = dataUrl;
    });
    
    return {
      secure_url: dataUrl,
      width: dimensions.width,
      height: dimensions.height,
      format: file.type.split('/')[1] || 'jpeg',
      original_filename: file.name,
      bytes: file.size
    };
  } catch (error) {
    console.error('Error saving image locally:', error);
    throw error;
  }
};
