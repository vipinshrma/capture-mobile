const siteUrlValue = process.env.NEXT_PUBLIC_SITE_URL?.trim();

if (!siteUrlValue) throw new Error("NEXT_PUBLIC_SITE_URL is required");

const parsedSiteUrl = new URL(siteUrlValue);

if (!["http:", "https:"].includes(parsedSiteUrl.protocol)) {
  throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute HTTP(S) URL");
}

if (parsedSiteUrl.pathname !== "/" || parsedSiteUrl.search || parsedSiteUrl.hash) {
  throw new Error("NEXT_PUBLIC_SITE_URL must contain only the site origin");
}

export const SITE_URL = new URL("/", parsedSiteUrl).href;
export const SOCIAL_IMAGE_URL = new URL("assets/social-preview.png", SITE_URL).href;
export const THANKS_URL = new URL("thanks", SITE_URL).href;

export const FORMSPREE_FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID?.trim() ?? "";
export const FORM_ENDPOINT = FORMSPREE_FORM_ID ? `https://formspree.io/f/${FORMSPREE_FORM_ID}` : "";
