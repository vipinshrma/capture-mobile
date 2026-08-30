import type { Capture, CaptureKind } from "../types";

const IMAGE_URL_PATTERN = /^https?:\/\/\S+\.(?:png|jpe?g|webp|gif|heic|heif)(?:[?#]\S*)?$/i;
const PLATFORMS = [
  ["linkedin.com", "in", "LinkedIn", "#0A66C2"],
  ["x.com", "X", "X", "#111111"],
  ["twitter.com", "X", "X", "#111111"],
  ["instagram.com", "IG", "Instagram", "#C13584"],
  ["youtube.com", "YT", "YouTube", "#FF0000"],
  ["youtu.be", "YT", "YouTube", "#FF0000"],
  ["github.com", "GH", "GitHub", "#24292F"],
  ["facebook.com", "f", "Facebook", "#1877F2"],
  ["reddit.com", "R", "Reddit", "#FF4500"],
  ["medium.com", "M", "Medium", "#111111"],
  ["notion.com", "N", "Notion", "#111111"],
  ["notion.so", "N", "Notion", "#111111"],
  ["notion.site", "N", "Notion", "#111111"],
  ["tiktok.com", "TT", "TikTok", "#111111"],
  ["pinterest.com", "P", "Pinterest", "#E60023"],
  ["threads.net", "T", "Threads", "#111111"],
  ["snapchat.com", "SC", "Snapchat", "#FFFC00"],
  ["telegram.org", "TG", "Telegram", "#26A5E4"],
  ["discord.com", "D", "Discord", "#5865F2"],
  ["twitch.tv", "TW", "Twitch", "#9146FF"],
  ["dribbble.com", "D", "Dribbble", "#EA4C89"],
  ["behance.net", "B", "Behance", "#1769FF"],
  ["producthunt.com", "PH", "Product Hunt", "#DA552F"],
  ["substack.com", "S", "Substack", "#FF6719"],
  ["spotify.com", "S", "Spotify", "#1DB954"],
  ["figma.com", "F", "Figma", "#0ACF83"],
  ["drive.google.com", "G", "Google Drive", "#4285F4"],
  ["docs.google.com", "G", "Google Docs", "#4285F4"],
  ["dropbox.com", "D", "Dropbox", "#0061FF"],
] as const;

export function getImageUri(capture: Pick<Capture, "kind" | "source" | "metadataImage" | "localFileUri">) {
  if (capture.localFileUri) return capture.localFileUri;
  const source = (capture.metadataImage || capture.source)?.trim();
  if (!source || !/^https?:\/\//i.test(source)) return undefined;
  return capture.metadataImage || capture.kind === "image" || IMAGE_URL_PATTERN.test(source) ? source : undefined;
}

export function inferCaptureKind(kind: CaptureKind, source?: string) {
  return source && IMAGE_URL_PATTERN.test(source.trim()) ? "image" : kind;
}

export function getSourceUrl(source?: string, fallback?: string) {
  const value = source || fallback?.match(/https?:\/\/\S+/i)?.[0];
  return value && /^https?:\/\//i.test(value) ? value : undefined;
}

export function normalizeWebUrl(value: string) {
  const url = new URL(/^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`);
  if (!url.hostname.includes(".")) throw new Error("Invalid URL");
  return url.toString();
}

export function getPlatform(source?: string, fallback?: string) {
  try {
    const value = getSourceUrl(source, fallback) || source?.trim() || "";
    const host = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).hostname.replace(/^www\./, "");
    const platform = PLATFORMS.find(([domain]) => host === domain || host.endsWith(`.${domain}`));
    return platform && {
      label: platform[1],
      name: platform[2],
      color: platform[3],
      iconUri: `https://www.google.com/s2/favicons?sz=64&domain=${platform[0]}`,
    };
  } catch {
    return undefined;
  }
}
