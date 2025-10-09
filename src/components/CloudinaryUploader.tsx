"use client";

import { useState, useCallback } from "react";
import { CldUploadWidget, CldImage } from "next-cloudinary";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUD_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

interface CloudinaryUploaderProps {
  onUploadComplete?: (result: CloudinaryResult) => void;
  label?: string;
  folder?: string;
  resourceType?: 'image' | 'video' | 'audio' | 'raw' | 'auto';
  cropping?: boolean;
  multiple?: boolean;
  showPreview?: boolean;
  previewWidth?: number;
  previewHeight?: number;
  maxFileSizeBytes?: number;
  renderTrigger?: (props: { open: () => void }) => React.ReactNode;
}

interface CloudinaryResult {
  publicId: string;
  secureUrl: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  resourceType?: string;
  bytes?: number;
}

export default function CloudinaryUploader({
  onUploadComplete,
  label = "Upload Media",
  folder = "newtonbotics/uploads",
  resourceType = "image",
  cropping = false,
  multiple = false,
  showPreview = true,
  previewWidth = 300,
  previewHeight = 300,
  maxFileSizeBytes,
  renderTrigger,
}: CloudinaryUploaderProps) {
  const [lastResult, setLastResult] = useState<CloudinaryResult | null>(null);
  const [error, setError] = useState("");

  const handleSuccess = useCallback(
    (result: any) => {
      setError("");
      const info = result?.info || result;
      if (!info?.public_id) return;
      
      const payload: CloudinaryResult = {
        publicId: info.public_id,
        secureUrl: info.secure_url || info.url,
        url: info.url || info.secure_url,
        width: info.width,
        height: info.height,
        format: info.format,
        resourceType: info.resource_type,
        bytes: info.bytes,
      };
      
      setLastResult(payload);
      onUploadComplete?.(payload);
    },
    [onUploadComplete]
  );

  const handleError = useCallback((err: any) => {
    const message = err?.statusText || err?.message || "Upload failed";
    setError(message);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <CldUploadWidget
        options={{
          cloudName: CLOUD_NAME,
          apiKey: CLOUD_API_KEY,
          folder,
          resourceType,
          cropping,
          multiple,
          ...(maxFileSizeBytes ? { maxFileSize: maxFileSizeBytes } : {}),
        }}
        uploadPreset={undefined}
        signatureEndpoint="/api/cloudinary/sign"
        apiKey={CLOUD_API_KEY}
        onUpload={handleSuccess}
        onSuccess={handleSuccess}
        onError={handleError}
      >
        {({ open }) => (
          renderTrigger ? (
            renderTrigger({ open })
          ) : (
            <button
              type="button"
              onClick={() => open()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {label}
            </button>
          )
        )}
      </CldUploadWidget>

      {error ? <span className="text-xs text-red-400">{error}</span> : null}

      {showPreview && lastResult?.publicId ? (
        <div className="mt-2">
          {lastResult.resourceType === 'video' ? (
            <video
              src={lastResult.secureUrl}
              width={previewWidth}
              height={previewHeight}
              controls
              className="rounded border"
              style={{ maxWidth: '100%', height: 'auto' }}
            >
              Your browser does not support the video tag.
            </video>
          ) : lastResult.resourceType === 'audio' ? (
            <div className="border rounded p-4 bg-gray-50">
              <audio
                src={lastResult.secureUrl}
                controls
                className="w-full"
              >
                Your browser does not support the audio tag.
              </audio>
              <p className="text-xs text-gray-500 mt-2">Audio file uploaded</p>
            </div>
          ) : (
            <CldImage
              src={lastResult.publicId}
              width={previewWidth}
              height={previewHeight}
              alt="Upload preview"
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
