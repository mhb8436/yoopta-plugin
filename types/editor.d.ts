import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import { YooEditor } from '@yoopta/editor';

export type ImageProps = {
  src: string;
  alt: string;
  sizes?: {
    width?: number;
    height?: number;
  };
  fit?: string;
  srcSet?: string | null;
};

export type CustomEditor = YooEditor & {
  insertImage: (imageProps: ImageProps) => void;
};

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
  }
}
