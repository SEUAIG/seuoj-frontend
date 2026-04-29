import React, { useEffect, useRef, useState } from "react";
import { ImageUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { uploadImage } from "@/services/image/uploadImage";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface MarkdownImageTextareaProps
  extends Omit<React.ComponentProps<"textarea">, "value" | "onChange"> {
  value: string;
  onValueChange: (value: string) => void;
}

const IMAGE_TEMPLATE = (url: string) => `![](${url})`;

function normalizeImageUrl(rawUrl: string) {
  return rawUrl;
}

function appendAtEnd(content: string, insertText: string) {
  if (!content) return insertText;
  if (content.endsWith("\n")) return `${content}${insertText}`;
  return `${content}\n${insertText}`;
}

export function MarkdownImageTextarea({
  value,
  onValueChange,
  disabled,
  onPaste,
  onBlur,
  className,
  ...props
}: MarkdownImageTextareaProps) {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const latestValueRef = useRef(value);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  const insertImageTag = (url: string) => {
    const normalizedUrl = normalizeImageUrl(url);
    const insertText = IMAGE_TEMPLATE(normalizedUrl);
    const textarea = textAreaRef.current;
    const isFocused = document.activeElement === textarea;
    const currentValue = latestValueRef.current;

    if (textarea && isFocused) {
      const start = textarea.selectionStart ?? 0;
      const end = textarea.selectionEnd ?? start;
      const nextValue = `${currentValue.slice(0, start)}${insertText}${currentValue.slice(end)}`;
      latestValueRef.current = nextValue;
      onValueChange(nextValue);

      const caret = start + insertText.length;
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(caret, caret);
      });
      return;
    }

    const nextValue = appendAtEnd(currentValue, insertText);
    latestValueRef.current = nextValue;
    onValueChange(nextValue);
  };

  const uploadAndInsert = async (files: File[]) => {
    if (!files.length) return;
    setIsUploading(true);

    try {
      for (const file of files) {
        const response = await uploadImage(file);
        if (response.code !== 0 && response.code !== 200) {
          throw new Error(response.message || "图片上传失败");
        }
        if (!response.data?.url) {
          throw new Error("图片上传成功但未返回 URL");
        }
        insertImageTag(response.data.url);
      }
      toast.success("图片已插入");
    } catch (error) {
      const message = error instanceof Error ? error.message : "图片上传失败";
      toast.error(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    await uploadAndInsert(imageFiles);
  };

  const handlePaste = async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const imageFiles = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => !!file);

    if (imageFiles.length > 0) {
      event.preventDefault();
      await uploadAndInsert(imageFiles);
      return;
    }

    onPaste?.(event);
  };

  return (
    <div className="space-y-2">
      <Tabs defaultValue="edit" className="w-full">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled || isUploading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
            >
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ImageUp className="mr-2 h-4 w-4" />
              )}
              {isUploading ? "上传中..." : "上传图片"}
            </Button>
            <span className="text-xs text-muted-foreground">支持粘贴截图上传</span>
          </div>
          <TabsList>
            <TabsTrigger value="edit">编辑</TabsTrigger>
            <TabsTrigger value="preview">预览</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="edit">
          <Textarea
            ref={textAreaRef}
            value={value}
            disabled={disabled || isUploading}
            onChange={(event) => onValueChange(event.target.value)}
            onPaste={handlePaste}
            onBlur={onBlur}
            className={className}
            {...props}
          />
        </TabsContent>
        <TabsContent value="preview">
          <div
            className={cn(
              "min-h-[120px] rounded-md border border-input bg-background p-3 text-sm",
              className
            )}
          >
            {value.trim() ? (
              <div className="prose prose-sm max-w-none">
                <MarkdownRenderer>{value}</MarkdownRenderer>
              </div>
            ) : (
              <p className="text-muted-foreground">暂无内容可预览</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
