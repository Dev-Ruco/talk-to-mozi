/**
 * Utility functions for image URL validation
 */

// Default placeholder image for articles without valid images
export const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop';

/**
 * Check if an image URL is valid (not a blob: URL and not empty)
 */
export function isValidImageUrl(url?: string | null): boolean {
  if (!url) return false;
  if (url.startsWith('blob:')) return false;
  if (url.trim() === '') return false;
  return true;
}

/**
 * Get a valid image URL or return a placeholder
 */
export function getValidImageUrl(url?: string | null, placeholder: string = PLACEHOLDER_IMAGE): string {
  return isValidImageUrl(url) ? url! : placeholder;
}
