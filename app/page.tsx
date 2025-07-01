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
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<number | null>(null);

  // Create a function to insert an image into the editor
  const insertImage = useCallback(
    (imageProps: ImageProps) => {
      console.log("Inserting image with props:", imageProps);

      try {
        // Instead of using the Blocks API which is causing errors,
        // let's create and insert the image block manually

        // Create a new block ID
        const blockId = currentBlockId || crypto.randomUUID();
        const imageId = crypto.randomUUID();

        // Create a new blocks object with the current state
        const currentBlocks = { ...value };

        const blockOrder = currentOrder || Object.keys(currentBlocks).length;
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
          meta: { order: blockOrder, depth: 0 },
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
      console.error("Error uploading image to server:", error);
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

  const onChange = (
    newValue: YooptaContentValue,
    options: YooptaOnChangeOptions
  ) => {
    console.log("onChange", JSON.stringify(options));
    const lastOperation = options.operations[options.operations.length - 1];
    console.log("Last operation:");
    if (
      lastOperation.type === "insert_block" ||
      lastOperation.type === "set_block_value"
    ) {
      //@ts-ignore
      setCurrentBlockId(lastOperation.block.id);
      //@ts-ignore
      setCurrentOrder(lastOperation.block.meta.order);
    }
    // if (lastOperation && lastOperation.block) {
    //   setCurrentBlockId(lastOperation.block.id);
    // }
    // const lastBlockId = lastOperation?.block?.id;
    // console.log("Last block ID:", lastBlockId);

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
