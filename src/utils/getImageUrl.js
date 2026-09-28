export function getImageUrl(path) {
  if (!path) {
    return "";
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  const baseUrl =
    import.meta.env.VITE_API_URL?.replace(
      /\/api\/?$/,
      ""
    );

  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}