/**
 * Constructs the full URL for an image from a given path.
 * If the path is already a full URL, it returns it directly.
 * Otherwise, it prepends the VITE_API_URL from environment variables.
 *
 * @param {string | null | undefined} path - The relative or absolute path to the image.
 * @returns {string | null} The full image URL or null if the path is not provided.
 */
export const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;

  // Ensure there's no double slash if the path already starts with one
  const baseUrl = (import.meta.env.VITE_API_URL as string).endsWith('/')
    ? (import.meta.env.VITE_API_URL as string).slice(0, -1)
    : (import.meta.env.VITE_API_URL as string);

  const imagePath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${imagePath}`;
};
