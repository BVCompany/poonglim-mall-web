/**
 * RichTextEditor
 *
 * Tiptap 기반 리치 텍스트 에디터.
 * 텍스트 서식 + 이미지 삽입(Supabase 업로드) 지원.
 */
"use client";

import { useCallback, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";

import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  ImagePlus,
  Undo,
  Redo,
  Minus,
} from "lucide-react";
import { Loader2 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  bucket?: "products" | "media" | "documents";
  folder?: string;
  minHeight?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "내용을 입력하세요...",
  bucket = "media",
  folder = "events",
  minHeight = 320,
}: RichTextEditorProps) {
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-[#02633E] underline" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "outline-none",
      },
    },
  });

  // 이미지 파일 → Supabase 업로드 → 에디터에 삽입
  const handleImageFile = useCallback(
    async (file: File) => {
      if (!editor) return;
      setImageUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("bucket", bucket);
        fd.append("folder", folder);

        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("업로드 실패");
        const { url } = (await res.json()) as { url: string };

        editor.chain().focus().setImage({ src: url }).run();
      } catch (err) {
        alert("이미지 업로드에 실패했습니다.");
        console.error(err);
      } finally {
        setImageUploading(false);
      }
    },
    [editor, bucket, folder],
  );

  const handleImageButtonClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
    e.target.value = "";
  };

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("링크 URL 입력", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) return null;

  const btnBase =
    "flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30";
  const btnActive = "bg-gray-200 text-gray-900";

  const ToolbarBtn = ({
    onClick,
    active,
    disabled,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title?: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={`${btnBase} ${active ? btnActive : ""}`}
    >
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* ── 툴바 ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        {/* 실행취소 / 다시실행 */}
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="실행취소">
          <Undo className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="다시실행">
          <Redo className="h-4 w-4" />
        </ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* 제목 */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="제목 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="제목 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* 텍스트 스타일 */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="굵게"
        >
          <Bold className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="기울임"
        >
          <Italic className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="취소선"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* 리스트 */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="글머리 기호"
        >
          <List className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="번호 매기기"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* 정렬 */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="왼쪽 정렬"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="가운데 정렬"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="오른쪽 정렬"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* 구분선 */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="구분선"
        >
          <Minus className="h-4 w-4" />
        </ToolbarBtn>

        {/* 링크 */}
        <ToolbarBtn onClick={setLink} active={editor.isActive("link")} title="링크">
          <LinkIcon className="h-4 w-4" />
        </ToolbarBtn>

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* 이미지 업로드 */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleImageButtonClick(); }}
          disabled={imageUploading}
          title="이미지 삽입"
          className={`${btnBase} gap-1.5 w-auto px-2.5 text-xs font-medium`}
          style={{ backgroundColor: "#EAE3C9", color: "#003F2B" }}
        >
          {imageUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          이미지 삽입
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* ── 에디터 본문 ── */}
      <EditorContent
        editor={editor}
        className="rich-editor px-4 py-3 text-sm text-gray-800"
        style={{ minHeight }}
      />
    </div>
  );
}
