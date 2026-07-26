import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: "discard",
};

export function sanitizeMessageBody(body: string): string {
  return sanitizeHtml(body.trim(), SANITIZE_OPTIONS).slice(0, 4000);
}

export function isValidMessageBody(body: string): boolean {
  const sanitized = sanitizeMessageBody(body);
  return sanitized.length > 0;
}
