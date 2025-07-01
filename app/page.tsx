"use client";

import YooptaEditor, {
  createYooptaEditor,
  Elements,
  Blocks,
  useYooptaEditor,
  YooptaContentValue,
  YooptaOnChangeOptions,
} from "@yoopta/editor";

import Paragraph from "@yoopta/paragraph";
import Blockquote from "@yoopta/blockquote";
import Embed from "@yoopta/embed";
import Image from "@yoopta/image";
import Link from "@yoopta/link";
import Callout from "@yoopta/callout";
import Video from "@yoopta/video";
import File from "@yoopta/file";
import Accordion from "@yoopta/accordion";
import { NumberedList, BulletedList, TodoList } from "@yoopta/lists";
import {
  Bold,
  Italic,
  CodeMark,
  Underline,
  Strike,
  Highlight,
} from "@yoopta/marks";
import { HeadingOne, HeadingThree, HeadingTwo } from "@yoopta/headings";
import Code from "@yoopta/code";
import Table from "@yoopta/table";
import Divider from "@yoopta/divider";
import ActionMenuList, {
  DefaultActionMenuRender,
} from "@yoopta/action-menu-list";
import Toolbar, { DefaultToolbarRender } from "@yoopta/toolbar";
import LinkTool, { DefaultLinkToolRender } from "@yoopta/link-tool";

import { uploadImageToServer } from "../utils/serverImageUpload";
import { useClipboardPaste } from "../hooks/useClipboardPaste";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { CustomEditor, ImageProps } from "../types/editor";
import { WITH_BASIC_INIT_VALUE } from "./initValue";

const plugins = [
  Paragraph,
  Table,
  Divider.extend({
    elementProps: {
      divider: (props) => ({
        ...props,
        color: "#007aff",
      }),
    },
  }),
  Accordion,
  HeadingOne,
  HeadingTwo,
  HeadingThree,
  Blockquote,
  Callout,
  NumberedList,
  BulletedList,
  TodoList,
  Code,
  Link,
  Embed,
  Image.extend({
    options: {
      async onUpload(file) {
        const data = await uploadImageToServer(file);

        return {
          src: data.secure_url,
          alt: "Pasted image",
          sizes: {
            width: data.width,
            height: data.height,
          },
        };
      },
    },
  }),
  Video.extend({
    options: {
      async onUpload(file: File) {
        const data = await uploadImageToServer(file);
        return {
          src: data.secure_url,
          alt: "Video",
          sizes: {
            width: data.width,
            height: data.height,
          },
        };
      },
      async onUploadPoster(file: File) {
        const data = await uploadImageToServer(file);
        return data.secure_url;
      },
    },
  }),
  File.extend({
    options: {
      async onUpload(file: File) {
        const data = await uploadImageToServer(file);
        return {
          src: data.secure_url,
          format: data.format,
          name: data.original_filename,
          size: data.bytes,
        };
      },
    },
  }),
];

const TOOLS = {
  ActionMenu: {
    render: DefaultActionMenuRender,
    tool: ActionMenuList,
  },
  Toolbar: {
    render: DefaultToolbarRender,
    tool: Toolbar,
  },
  LinkTool: {
    render: DefaultLinkToolRender,
    tool: LinkTool,
  },
};

const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

function WithBaseFullSetup() {
  const [value, setValue] = useState(WITH_BASIC_INIT_VALUE);
  const editor = useMemo(() => createYooptaEditor(), []);

  // Create a function to insert an image into the editor
  const insertImage = useCallback(
    (imageProps: ImageProps) => {
      console.log("Inserting image with props:", imageProps);

      try {
        // Instead of using the Blocks API which is causing errors,
        // let's create and insert the image block manually

        // Create a new block ID
        const blockId = crypto.randomUUID();
        const imageId = crypto.randomUUID();

        // Create a new blocks object with the current state
        const currentBlocks = { ...value };

        // Create the image block with the proper structure
        currentBlocks[blockId] = {
          id: blockId,
          type: "Image",
          value: [
            {
              id: imageId,
              type: "image",
              children: [{ text: "" }],
              props: {
                src: imageProps.src,
                alt: imageProps.alt || "Pasted image",
                nodeType: "void",
                sizes: imageProps.sizes,
              },
            },
          ],
          meta: { order: Object.keys(currentBlocks).length, depth: 0 },
        };

        console.log("Current blocks:", currentBlocks);
        // Update the editor state with the new blocks
        setValue(currentBlocks);
        editor.setEditorValue(currentBlocks);

        // Force a re-render to ensure the UI updates
        setTimeout(() => {
          const editorElement = document.querySelector(".yoopta-editor");
          if (editorElement) {
            // Trigger a click to ensure the editor updates
            editorElement.dispatchEvent(new Event("click", { bubbles: true }));
          }
        }, 100);

        console.log("Image inserted using Yoopta Editor API");
      } catch (error) {
        console.error("Error inserting image:", error);
      }
    },
    [value, setValue]
  );

  const selectionRef = useRef(null);

  // Handle image upload from clipboard
  const handleImageUpload = useCallback(async (file: File) => {
    try {
      // Upload the image to the server
      return await uploadImageToServer(file);
    } catch (error) {
      console.error('Error uploading image to server:', error);
      throw error;
    }
  }, []);

  // Use our custom clipboard paste hook with the insertImage function
  const pasteRef = useClipboardPaste({
    editor,
    uploadImage: handleImageUpload,
    onImagePaste: insertImage,
  });

  console.log("Clipboard paste hook initialized");

  // Add a direct paste handler to the editor element as a backup
  useEffect(() => {
    // Wait for the editor to be fully mounted
    setTimeout(() => {
      const editorElement = document.querySelector(".yoopta-editor");
      if (!editorElement) {
        console.log("Direct paste handler: Editor element not found");
        return;
      }

      console.log(
        "Direct paste handler: Adding paste event listener to editor element"
      );

      const handleDirectPaste = async (e: Event) => {
        // Cast to ClipboardEvent
        const clipboardEvent = e as ClipboardEvent;
        console.log(
          "Direct paste handler: Paste event detected on editor element"
        );

        // Check for files in the clipboard
        if (
          clipboardEvent.clipboardData?.files &&
          clipboardEvent.clipboardData.files.length > 0
        ) {
          for (let i = 0; i < clipboardEvent.clipboardData.files.length; i++) {
            const file = clipboardEvent.clipboardData.files[i];
            console.log(
              `Direct paste handler: File ${i} - type: ${file.type}, name: ${file.name}`
            );

            if (file.type.indexOf("image") !== -1) {
              console.log(
                "Direct paste handler: Found image file, processing..."
              );
              clipboardEvent.preventDefault();
              clipboardEvent.stopPropagation();

              try {
                const imageData = await handleImageUpload(file);
                console.log(
                  "Direct paste handler: Image uploaded successfully",
                  imageData
                );

                insertImage({
                  src: imageData.secure_url,
                  alt: "Pasted image",
                  sizes: {
                    width: imageData.width || 800,
                    height: imageData.height || 600,
                  },
                });
              } catch (error) {
                console.error(
                  "Direct paste handler: Failed to process image",
                  error
                );
              }

              break;
            }
          }
        } else {
          console.log("Direct paste handler: No files found in clipboard");

          // Log clipboard data for debugging
          console.log(
            "Direct paste handler: Clipboard data details:",
            clipboardEvent.clipboardData
          );

          // Check if there's any HTML content that might contain an image
          const html = clipboardEvent.clipboardData?.getData("text/html");
          if (html) {
            console.log(
              "Direct paste handler: Found HTML content in clipboard",
              html
            );

            // Check if HTML contains an img tag
            const imgRegex = /<img[^>]+src="([^"]+)"/i;
            const match = html.match(imgRegex);

            if (match && match[1]) {
              const imgSrc = match[1];
              console.log(
                "Direct paste handler: Found image in HTML content",
                imgSrc
              );

              try {
                // Create a placeholder image with the src from clipboard
                insertImage({
                  src: imgSrc,
                  alt: "Pasted image",
                  sizes: {
                    width: 800,
                    height: 600,
                  },
                });
              } catch (error) {
                console.error(
                  "Direct paste handler: Failed to insert HTML image",
                  error
                );
              }
            }
          } else {
            console.log(
              "Direct paste handler: No HTML content found in clipboard"
            );
          }
        }
      };

      editorElement.addEventListener(
        "paste",
        handleDirectPaste as EventListener
      );

      return () => {
        editorElement.removeEventListener(
          "paste",
          handleDirectPaste as EventListener
        );
        console.log(
          "Direct paste handler: Removed paste event listener from editor element"
        );
      };
    }, 1500); // Wait 1 second for the editor to be fully mounted

    // Cleanup function
    return () => {};
  }, [handleImageUpload, insertImage]);

  const onChange = (
    newValue: YooptaContentValue,
    options: YooptaOnChangeOptions
  ) => {
    setValue(newValue);
  };

  return (
    <div
      className="md:py-[100px] md:pl-[200px] md:pr-[80px] px-[20px] pt-[80px] pb-[40px] flex justify-center"
      ref={selectionRef}
    >
      <div ref={pasteRef}>
        <YooptaEditor
          editor={editor}
          plugins={plugins as any[]}
          tools={TOOLS}
          marks={MARKS}
          selectionBoxRoot={selectionRef}
          value={value}
          onChange={onChange}
          autoFocus
        />
      </div>
    </div>
  );
}

export default WithBaseFullSetup;
