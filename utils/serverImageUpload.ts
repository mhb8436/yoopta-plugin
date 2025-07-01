/**
 * Server Image Upload Utility
 * This utility uploads images to a server and returns the URL
 */

// Define the response type from the server
export interface ImageUploadResponse {
  url: string;
  width: number;
  height: number;
  format: string;
  filename: string;
  size: number;
}

/**
 * Upload an image to the server
 * @param file The image file to upload
 * @returns An object with the image URL and dimensions
 */
export const uploadImageToServer = async (file: File) => {
  try {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('image', file);
    
    // Replace this URL with your actual image upload endpoint
    const uploadUrl = '/api/upload-image';
    
    // Upload the image
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    const data: ImageUploadResponse = await response.json();
    
    // Return in the format expected by the editor
    // Make sure we're using the full URL
    console.log('Server image upload successful, URL:', data.url);
    return {
      secure_url: data.url, // This should now be a full URL with http://localhost:3000
      width: data.width,
      height: data.height,
      format: data.format,
      original_filename: data.filename,
      bytes: data.size
    };
  } catch (error) {
    console.error('Error uploading image to server:', error);
    
    // Fallback to local storage if server upload fails
    console.log('Falling back to local image storage');
    const { saveImageLocally } = await import('./localImageStorage');
    return saveImageLocally(file);
  }
};
