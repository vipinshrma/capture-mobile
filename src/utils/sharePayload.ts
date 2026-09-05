import type { ResolvedSharePayload, SharePayload } from "expo-sharing";
import type { CaptureKind } from "../types";
import { getSourceUrl } from "./capture.ts";

export const MAX_ATTACHMENT_BYTES = 100 * 1024 * 1024;
export const isAttachmentSizeAllowed = (size: number) => size <= MAX_ATTACHMENT_BYTES;

export type SharedCaptureInput = {
  kind: CaptureKind;
  title: string;
  source?: string;
  localFileUri?: string;
  mimeType?: string;
};

export function mapSharedPayload(payload: SharePayload | ResolvedSharePayload): SharedCaptureInput {
  if (["text", "url"].includes(payload.shareType) && payload.value.length > 1_000_000) throw new Error("Shared text exceeds the 1 MB limit");
  const sharedUrl = getSourceUrl(undefined, payload.value);
  if (payload.shareType === "url" || sharedUrl) return { kind: "link", title: sharedUrl || payload.value, source: sharedUrl || payload.value };
  if (payload.shareType === "text") return { kind: "note", title: payload.value };

  const resolved = payload as ResolvedSharePayload;
  const kind: CaptureKind = payload.shareType === "image"
    ? "image"
    : payload.shareType === "audio" ? "voice" : "document";

  return {
    kind,
    title: resolved.originalName || `${kind === "voice" ? "Audio" : kind === "image" ? "Image" : "Document"} capture`,
    localFileUri: resolved.contentUri || payload.value,
    mimeType: resolved.contentMimeType || payload.mimeType,
  };
}
