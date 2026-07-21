export type LinkMetadata = {
  metadataTitle?: string;
  metadataDescription?: string;
  metadataImage?: string;
  metadataSiteName?: string;
};

const pick = (html: string, patterns: RegExp[]) => {
  for (const pattern of patterns) {
    const match = html.match(pattern)?.[1]?.trim();
    if (match) return decode(match);
  }
  return undefined;
};

const decode = (value: string) => value
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, "\"")
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");

export async function fetchLinkMetadata(url: string): Promise<LinkMetadata> {
  const response = await fetch(url, { headers: { "User-Agent": "Tuck/1.0" } });
  const html = await response.text();
  const metadataImage = pick(html, [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  ]);

  return {
    metadataTitle: pick(html, [
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
      /<title[^>]*>([^<]+)<\/title>/i,
    ]),
    metadataDescription: pick(html, [
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    ]),
    metadataImage: metadataImage ? new URL(metadataImage, url).toString() : undefined,
    metadataSiteName: pick(html, [
      /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i,
    ]),
  };
}
