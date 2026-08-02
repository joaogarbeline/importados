"use client";

import { useRef, useState } from "react";
import { UploadIcon, XIcon, Loader2Icon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ImageUploadField({
  name,
  label,
  defaultValue,
  single = false,
}: {
  name: string;
  label: string;
  defaultValue?: string[];
  single?: boolean;
}) {
  const [images, setImages] = useState<string[]>(defaultValue ?? []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Falha no upload.");
        uploaded.push(data.url);
      }
      setImages((current) => (single ? uploaded.slice(0, 1) : [...current, ...uploaded]));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no upload.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((current) => current.filter((i) => i !== url));
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>

      <div className="flex flex-wrap gap-2">
        {images.map((url) => (
          <div
            key={url}
            className="group relative size-20 shrink-0 overflow-hidden rounded-lg border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <XIcon className="size-5 text-white" />
            </button>
          </div>
        ))}

        {(!single || images.length === 0) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex size-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {uploading ? (
              <Loader2Icon className="size-5 animate-spin" />
            ) : (
              <UploadIcon className="size-5" />
            )}
            <span className="text-[10px]">Enviar</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={!single}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      <p className="text-xs text-muted-foreground">
        Ou cole URLs de imagens (uma por linha):
      </p>
      <Textarea
        name={name}
        rows={2}
        value={images.join("\n")}
        onChange={(e) =>
          setImages(
            e.target.value
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          )
        }
        placeholder="https://exemplo.com/produto.jpg"
      />
    </div>
  );
}
