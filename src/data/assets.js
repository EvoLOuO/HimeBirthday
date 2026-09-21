// Vite rewrites BASE_URL for GitHub Pages (/HimeBirthday/), while local dev
// keeps it as /. Keep every public/ asset URL relative to that base.
export function publicAsset(path) {
  const cleanPath = String(path).replace(/^\/+/, "");
  const base = import.meta.env?.BASE_URL || "/";
  return `${base.replace(/\/+$/, "")}/${cleanPath}`;
}
