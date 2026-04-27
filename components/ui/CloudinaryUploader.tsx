"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Upload, X } from "lucide-react";
import { cloudinaryUrl } from "@/lib/cloudinary";

interface CloudinaryUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  shape?: "square" | "circle";
  size?: number;
}

const UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "peersview";

export function CloudinaryUploader({
  value,
  onChange,
  folder = "peersview",
  label = "Upload image",
  shape = "square",
  size = 96,
}: CloudinaryUploaderProps) {
  const radius = shape === "circle" ? "rounded-full" : "rounded-xl";

  return (
    <div className="flex items-center gap-4">
      <div
        className={`${radius} bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0`}
        style={{ width: size, height: size }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cloudinaryUrl(value, {
              width: size * 2,
              height: size * 2,
              crop: "fill",
            })}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />
        ) : (
          <Upload className="w-6 h-6 text-gray-400" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <CldUploadWidget
          uploadPreset={UPLOAD_PRESET}
          options={{
            folder,
            multiple: false,
            sources: ["local", "url", "camera"],
            maxFileSize: 5_000_000,
            clientAllowedFormats: ["png", "jpg", "jpeg", "webp", "svg"],
          }}
          onSuccess={(result) => {
            if (
              result?.info &&
              typeof result.info === "object" &&
              "secure_url" in result.info
            ) {
              onChange((result.info as { secure_url: string }).secure_url);
            }
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="btn-secondary text-sm py-2 px-4 inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {value ? "Change" : label}
            </button>
          )}
        </CldUploadWidget>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-red-500 hover:underline inline-flex items-center gap-1 self-start"
          >
            <X className="w-3 h-3" /> Remove
          </button>
        )}
      </div>
    </div>
  );
}
