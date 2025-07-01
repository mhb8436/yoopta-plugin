import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, access } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { constants } from 'fs';

// Define the image upload directory
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

// Get the base URL for the current environment
const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  return 'http://localhost:3000'; // Default for local development
};

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const fileExtension = file.name.split('.').pop() || 'png';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Convert the file to an ArrayBuffer
    const buffer = await file.arrayBuffer();

    // Ensure the upload directory exists
    try {
      // Check if the upload directory exists
      try {
        await access(UPLOAD_DIR, constants.F_OK);
      } catch {
        // If not, create it
        console.log(`Creating upload directory: ${UPLOAD_DIR}`);
        await mkdir(UPLOAD_DIR, { recursive: true });
      }
      
      // Write the file
      await writeFile(filePath, Buffer.from(buffer));
      console.log(`File saved to: ${filePath}`);
    } catch (error) {
      console.error('Error writing file:', error);
      return NextResponse.json(
        { error: 'Failed to save the file' },
        { status: 500 }
      );
    }

    // Create the full image URL with base URL
    const baseUrl = getBaseUrl();
    const relativePath = `/uploads/${fileName}`;
    const fullImageUrl = `${baseUrl}${relativePath}`;
    
    // Return the image URL and metadata
    return NextResponse.json({
      url: fullImageUrl,
      width: 800, // We'd normally get this from the image
      height: 600, // We'd normally get this from the image
      format: fileExtension,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error('Error handling image upload:', error);
    return NextResponse.json(
      { error: 'Failed to process the image' },
      { status: 500 }
    );
  }
}
