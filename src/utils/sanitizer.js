// src/utils/sanitizer.js
import DOMPurify from 'dompurify';

// For plain text fields like names, emails, etc.
export const sanitizePlainText = (content) => {
  const encodedContent = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  return DOMPurify.sanitize(encodedContent, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [] // No attributes allowed
  });
};

// For fields that might need some HTML (if you need it in the future)
export const sanitizeRichText = (content) => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'span', 'p', 'br'],
    ALLOWED_ATTR: ['class']
  });
};

// Sanitize all form fields
export const sanitizeFormData = (formData) => {
  return Object.keys(formData).reduce((acc, key) => {
    acc[key] = sanitizePlainText(formData[key]);
    return acc;
  }, {});
};