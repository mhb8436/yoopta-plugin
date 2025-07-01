import { useEffect, useRef } from "react";
import { YooEditor } from "@yoopta/editor";
import { ImageProps } from "../types/editor";

type DragAndDropOptions = {
  editor: YooEditor;
  uploadImage: (file: File) => Promise<any>;
  onImageDrop?: (imageProps: ImageProps) => void;
};

export const useDragAndDrop = ({
  editor,
  uploadImage,
  onImageDrop,
}: DragAndDropOptions) => {
  const dropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editor) {
      console.warn("useDragAndDrop: Editor not provided");
      return;
    }

    const handleDragOver = (e: DragEvent) => {
      // 기본 동작 방지 (브라우저에서 파일 열기)
      e.preventDefault();
      e.stopPropagation();

      // 드래그 오버 시 시각적 피드백을 위한 클래스 추가
      if (dropRef.current) {
        dropRef.current.classList.add("drag-over");
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // 드래그 리브 시 시각적 피드백 클래스 제거
      if (dropRef.current) {
        dropRef.current.classList.remove("drag-over");
      }
    };

    const handleDrop = async (e: DragEvent) => {
      // 기본 동작 방지 (브라우저에서 파일 열기)
      e.preventDefault();
      e.stopPropagation();

      // 드래그 오버 시각적 피드백 클래스 제거
      if (dropRef.current) {
        dropRef.current.classList.remove("drag-over");
      }

      // 드롭된 파일 확인
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        // console.log(`🎯 DEBUG: Found ${e.dataTransfer.files.length} files in drop`);

        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const file = e.dataTransfer.files[i];
          console.log(
            `useDragAndDrop: File ${i} - type: ${file.type}, name: ${file.name}`
          );

          // 이미지 파일인 경우 처리
          if (file.type.indexOf("image") !== -1) {
            console.log(`useDragAndDrop: Found image file: ${file.name}`);

            try {
              // 이미지 업로드 처리
              const imageData = await uploadImage(file);
              console.log(
                "useDragAndDrop: Image uploaded successfully",
                imageData
              );

              // 콜백 함수 호출
              if (onImageDrop) {
                onImageDrop({
                  src: imageData.secure_url,
                  alt: `Dropped image: ${file.name}`,
                  sizes: {
                    width: imageData.width || 800,
                    height: imageData.height || 600,
                  },
                });
              }
              return; // 첫 번째 이미지 처리 후 종료
            } catch (error) {
              console.error(
                "useDragAndDrop: Failed to process image file:",
                error
              );
            }
          }
        }
      }
    };

    // 드롭 영역에 이벤트 리스너 추가
    const refElement = dropRef.current;
    if (refElement) {
      refElement.addEventListener("dragover", handleDragOver);
      refElement.addEventListener("dragleave", handleDragLeave);
      refElement.addEventListener("drop", handleDrop);
    }

    // 클린업 함수
    return () => {
      if (refElement) {
        refElement.removeEventListener("dragover", handleDragOver);
        refElement.removeEventListener("dragleave", handleDragLeave);
        refElement.removeEventListener("drop", handleDrop);
        console.log("useDragAndDrop: Event listeners removed from drop zone");
      }
    };
  }, [editor, uploadImage, onImageDrop]);

  return dropRef;
};
