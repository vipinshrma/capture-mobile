import { Directory, File, Paths } from "expo-file-system";
import { isAttachmentSizeAllowed } from "./sharePayload";

const capturesDirectory = new Directory(Paths.document, "captures");

export function persistSharedFile(uri: string, originalName?: string | null, knownSize?: number | null) {
  const source = new File(uri);
  if (!isAttachmentSizeAllowed(knownSize ?? source.size)) throw new Error("Attachment exceeds the 100 MB limit");
  capturesDirectory.create({ idempotent: true, intermediates: true });
  const safeName = (originalName || source.name || "attachment")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  const destination = new File(capturesDirectory, `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`);
  source.copy(destination);
  return destination.uri;
}

export function deleteLocalFile(uri?: string) {
  if (!uri) return;
  const file = new File(uri);
  if (file.exists) file.delete();
}

export function deleteAllLocalFiles() {
  if (capturesDirectory.exists) capturesDirectory.delete();
}
