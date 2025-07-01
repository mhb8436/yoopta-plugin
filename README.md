# Notion 스타일 에디터 프로젝트

## 프로젝트 개요

이 프로젝트는 Next.js와 Yoopta Editor를 기반으로 한 Notion과 유사한 블록 기반 에디터를 구현한 웹 애플리케이션입니다. 사용자는 다양한 유형의 블록(텍스트, 이미지, 비디오, 테이블 등)을 추가하고 편집할 수 있으며, 클립보드에서 이미지를 붙여넣기 기능도 지원합니다.

## 주요 기능

- **블록 기반 에디터**: 다양한 유형의 블록을 지원하는 Yoopta Editor 통합
- **이미지 처리**: 로컬 스토리지를 사용한 이미지 업로드 및 표시 (Data URL 방식)
- **클립보드 이미지 붙여넣기**: 클립보드에서 이미지를 감지하고 에디터에 삽입
- **다양한 블록 유형**: 단락, 표, 구분선, 아코디언, 제목, 인용구, 콜아웃, 목록, 코드, 링크, 임베드, 이미지, 비디오, 파일 등
- **마크업 도구**: 굵게, 기울임꼴, 코드, 밑줄, 취소선, 강조 등

## 기술 스택

- **프레임워크**: Next.js 15.3.4
- **언어**: TypeScript
- **에디터**: Yoopta Editor 4.9.9
- **스타일링**: TailwindCSS 4
- **기타 라이브러리**: React 19, UUID

## 프로젝트 구조

```
/
├── app/                  # Next.js 앱 디렉토리
│   └── page.tsx         # 메인 에디터 페이지
├── hooks/               # 커스텀 React 훅
│   └── useClipboardPaste.ts # 클립보드 이미지 붙여넣기 훅
├── types/               # TypeScript 타입 정의
│   └── editor.d.ts      # 에디터 관련 타입 정의
├── utils/               # 유틸리티 함수
│   ├── cloudinary.ts    # Cloudinary 관련 유틸리티 (레거시)
│   ├── localImageStorage.ts # 로컬 이미지 저장 유틸리티
│   └── serverImageUpload.ts # 서버 이미지 업로드 유틸리티
└── public/              # 정적 파일
```

## 최근 변경사항

- **로컬 이미지 저장 방식 변경**: Cloudinary에서 로컬 스토리지(Data URL)로 이미지 업로드 방식 변경
- **클립보드 이미지 붙여넣기 기능 추가**: 클립보드에서 이미지를 감지하고 에디터에 삽입하는 기능 구현
- **에디터 블록 관리 개선**: 블록 ID와 순서 관리 로직 개선

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (Turbopack 사용)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

## 개발 가이드

### 이미지 처리

이 프로젝트는 이미지를 로컬 스토리지에 Data URL 형식으로 저장합니다. `utils/localImageStorage.ts` 파일에 구현된 `saveImageLocally` 함수를 사용하여 이미지 파일을 Data URL로 변환하고 저장합니다.

```typescript
// 이미지 파일을 Data URL로 변환하여 저장
const imageData = await saveImageLocally(file);
```

### 클립보드 이미지 붙여넣기

`hooks/useClipboardPaste.ts`에 구현된 `useClipboardPaste` 훅을 사용하여 클립보드에서 이미지를 감지하고 에디터에 삽입할 수 있습니다.

```typescript
const pasteRef = useClipboardPaste({
  editor,
  uploadImage: handleImageUpload,
  onImagePaste: insertImage,
});
```

### 에디터 블록 관리

에디터의 블록 관리는 Yoopta Editor의 API를 사용합니다. 블록 ID와 순서는 `currentBlockId`와 `currentOrder` 상태 변수를 통해 관리됩니다.

## 라이선스

MIT
