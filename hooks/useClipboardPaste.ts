import { useEffect, useRef } from "react";
import { YooEditor } from "@yoopta/editor";
import { ImageProps } from "../types/editor";

type ClipboardPasteOptions = {
  editor: YooEditor;
  uploadImage: (file: File) => Promise<any>;
  onImagePaste?: (imageProps: ImageProps) => void;
};

export const useClipboardPaste = ({
  editor,
  uploadImage,
  onImagePaste,
}: ClipboardPasteOptions) => {
  const pasteRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editor) {
      console.warn("useClipboardPaste: Editor not provided");
      return;
    }

    console.log("useClipboardPaste: Initializing paste handler");

    // Function to create a file from a blob
    const createFileFromBlob = (blob: Blob, fileName: string): File => {
      return new File([blob], fileName, { type: blob.type });
    };

    // Function to handle image data URL
    const handleImageDataUrl = async (dataUrl: string) => {
      console.log("useClipboardPaste: Processing image data URL");
      
      try {
        // Convert data URL to blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = createFileFromBlob(blob, "pasted-image.png");
        
        // Upload the image
        const imageData = await uploadImage(file);
        console.log("useClipboardPaste: Image uploaded successfully", imageData);
        
        // Call the onImagePaste callback
        if (onImagePaste) {
          console.log("useClipboardPaste: Calling onImagePaste callback");
          onImagePaste({
            src: imageData.secure_url,
            alt: "Pasted image",
            sizes: {
              width: imageData.width || 800,
              height: imageData.height || 600,
            },
          });
          console.log("useClipboardPaste: Image URL being used:", imageData.secure_url);
        }
      } catch (error) {
        console.error("useClipboardPaste: Failed to process image data URL:", error);
      }
    };

    const handlePaste = async (e: ClipboardEvent) => {
      console.log("useClipboardPaste: Paste event detected");
      console.log("useClipboardPaste: Clipboard data:", e.clipboardData);

      // Method 1: Check for image files directly
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        console.log(`useClipboardPaste: Found ${e.clipboardData.files.length} files in clipboard`);
        
        for (let i = 0; i < e.clipboardData.files.length; i++) {
          const file = e.clipboardData.files[i];
          console.log(`useClipboardPaste: File ${i} - type: ${file.type}, name: ${file.name}`);
          
          if (file.type.indexOf("image") !== -1) {
            console.log(`useClipboardPaste: Found image file: ${file.name}`);
            e.preventDefault();
            
            try {
              const imageData = await uploadImage(file);
              console.log("useClipboardPaste: Image uploaded successfully", imageData);
              
              if (onImagePaste) {
                onImagePaste({
                  src: imageData.secure_url,
                  alt: "Pasted image",
                  sizes: {
                    width: imageData.width || 800,
                    height: imageData.height || 600,
                  },
                });
              }
              return; // Exit after handling the image
            } catch (error) {
              console.error("useClipboardPaste: Failed to process image file:", error);
            }
          }
        }
      }

      // Method 2: Check for items with image MIME types
      const items = e.clipboardData?.items;
      if (items && items.length > 0) {
        console.log(`useClipboardPaste: Found ${items.length} clipboard items`);
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          console.log(`useClipboardPaste: Item ${i} - type: ${item.type}, kind: ${item.kind}`);
          
          if (item.type.indexOf("image") !== -1) {
            console.log(`useClipboardPaste: Found image item type: ${item.type}`);
            e.preventDefault();
            
            const file = item.getAsFile();
            if (file) {
              try {
                const imageData = await uploadImage(file);
                console.log("useClipboardPaste: Image uploaded successfully", imageData);
                
                if (onImagePaste) {
                  onImagePaste({
                    src: imageData.secure_url,
                    alt: "Pasted image",
                    sizes: {
                      width: imageData.width || 800,
                      height: imageData.height || 600,
                    },
                  });
                }
                return; // Exit after handling the image
              } catch (error) {
                console.error("useClipboardPaste: Failed to process image item:", error);
              }
            }
          }
        }
      }

      // Method 3: Check for HTML content with image tags
      const html = e.clipboardData?.getData("text/html");
      if (html) {
        console.log("useClipboardPaste: Found HTML content in clipboard");
        
        // Check if HTML contains an img tag
        const imgRegex = /<img[^>]+src="([^"]+)"/i;
        const match = html.match(imgRegex);
        
        if (match && match[1]) {
          const imgSrc = match[1];
          console.log("useClipboardPaste: Found image in HTML content", imgSrc);
          e.preventDefault();
          
          // If it's a data URL, we can process it directly
          if (imgSrc.startsWith("data:image/")) {
            await handleImageDataUrl(imgSrc);
            return;
          }
          
          // If it's a remote URL, we can use it directly
          if (imgSrc.startsWith("http")) {
            if (onImagePaste) {
              onImagePaste({
                src: imgSrc,
                alt: "Pasted image",
                sizes: {
                  width: 800,
                  height: 600,
                },
              });
            }
            return;
          }
        }
      }

      console.log("useClipboardPaste: No image found in clipboard");
    };

    // Add paste event listener to the document
    document.addEventListener("paste", handlePaste);
    console.log("useClipboardPaste: Paste event listener added to document");

    // Add paste event listener to the ref element if available
    const refElement = pasteRef.current;
    if (refElement) {
      refElement.addEventListener("paste", handlePaste);
      console.log("useClipboardPaste: Paste event listener added to ref element");
    }

    // Cleanup
    return () => {
      document.removeEventListener("paste", handlePaste);
      console.log("useClipboardPaste: Paste event listener removed from document");
      
      if (refElement) {
        refElement.removeEventListener("paste", handlePaste);
        console.log("useClipboardPaste: Paste event listener removed from ref element");
      }
    };
  }, [editor, uploadImage, onImagePaste]);

  return pasteRef;
};
