import type { Capture, CaptureKind } from "../types";

const IMAGE_URL_PATTERN = /^https?:\/\/\S+\.(?:png|jpe?g|webp|gif|heic|heif)(?:[?#]\S*)?$/i;
const MAX_METADATA_HTML_LENGTH = 512 * 1024;
const PLATFORMS = [
  ["linkedin.com", "in", "LinkedIn", "#0A66C2"],
  ["x.com", "X", "X", "#111111"],
  ["twitter.com", "X", "X", "#111111"],
  ["instagram.com", "IG", "Instagram", "#C13584"],
  ["youtube.com", "YT", "YouTube", "#FF0000"],
  ["youtu.be", "YT", "YouTube", "#FF0000"],
  ["github.com", "GH", "GitHub", "#24292F"],
  ["dev.to", "DEV", "DEV Community", "#3B49DF"],
  ["facebook.com", "f", "Facebook", "#1877F2"],
  ["fb.com", "f", "Facebook", "#1877F2"],
  ["fb.watch", "f", "Facebook", "#1877F2"],
  ["meta.com", "M", "Meta", "#0668E1"],
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
  const value = (source || fallback?.match(/https?:\/\/\S+/i)?.[0])?.trim().replace(/[\])},.!?;]+$/, "");
  return value && /^https?:\/\//i.test(value) ? value : undefined;
}

export function normalizeWebUrl(value: string) {
  const url = new URL(/^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`);
  if (!url.hostname.includes(".")) throw new Error("Invalid URL");
  return url.toString();
}

export function formatCaptureTime(capturedAt?: string, fallback = "", now = new Date()) {
  if (!capturedAt) return fallback;
  const captured = new Date(capturedAt);
  if (Number.isNaN(captured.getTime())) return fallback;
  const minutes = Math.floor(Math.max(0, now.getTime() - captured.getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export function getPlatform(source?: string, fallback?: string) {
  try {
    const value = getSourceUrl(source, fallback) || source?.trim() || "";
    const host = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).hostname.replace(/^www\./, "");
    const platform = PLATFORMS.find(([domain]) => host === domain || host.endsWith(`.${domain}`));
    return {
      label: platform?.[1] || host.slice(0, 2).toUpperCase(),
      name: platform?.[2] || host,
      color: platform?.[3] || "#6B7280",
      iconUri: `https://www.google.com/s2/favicons?sz=128&domain=${platform?.[0] || host}`,
    };
  } catch {
    return undefined;
  }
}

export type LinkMetadata = {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
};

export async function fetchLinkMetadata(source: string): Promise<LinkMetadata> {
  // ponytail: direct Open Graph scraping is best-effort; add a server proxy only when blocked sites justify one.
  const url = normalizeWebUrl(source);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(url, {
      headers: { Accept: "text/html,application/xhtml+xml" },
      signal: controller.signal,
    });
    const contentType = response.headers.get("content-type") || "";
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (!response.ok || (contentType && !contentType.includes("text/html")) || contentLength > MAX_METADATA_HTML_LENGTH * 4) return {};
    return parseLinkMetadata((await response.text()).slice(0, MAX_METADATA_HTML_LENGTH), response.url || url);
  } finally {
    clearTimeout(timeout);
  }
}

export function parseLinkMetadata(html: string, source: string): LinkMetadata {
  const meta = new Map<string, string>();
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const attributes = Object.fromEntries(
      [...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gi)].map((match) => [match[1].toLowerCase(), match[3]]),
    );
    const key = (attributes.property || attributes.name || "").toLowerCase();
    if (key && attributes.content) meta.set(key, attributes.content);
  }

  const titleTag = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const image = cleanMetadataValue(meta.get("og:image") || meta.get("twitter:image"));
  return {
    title: cleanMetadataValue(meta.get("og:title") || meta.get("twitter:title") || titleTag, 300),
    description: cleanMetadataValue(meta.get("og:description") || meta.get("twitter:description") || meta.get("description"), 2_000),
    image: image ? absoluteHttpUrl(image, source) : undefined,
    siteName: cleanMetadataValue(meta.get("og:site_name"), 120),
  };
}

function cleanMetadataValue(value?: string, maxLength = 4_096) {
  if (!value) return undefined;
  const cleaned = value
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, maxLength) || undefined;
}

function absoluteHttpUrl(value: string, source: string) {
  try {
    const url = new URL(value, source);
    return /^https?:$/.test(url.protocol) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
