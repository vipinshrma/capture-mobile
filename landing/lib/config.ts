export const FORMSPREE_FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID?.trim() ?? "";
export const FORM_ENDPOINT = FORMSPREE_FORM_ID ? `https://formspree.io/f/${FORMSPREE_FORM_ID}` : "";
