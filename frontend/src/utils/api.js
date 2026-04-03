/** Backend origin — override with Vite env in production */
export const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000/api";

// Upload
export async function uploadFile(file, password, expiryMinutes = 10) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);
  formData.append("expiryMinutes", expiryMinutes);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  return res.json();
}

// Get all files
export async function getFiles() {
  const res = await fetch(`${API_BASE}/files`);
  return res.json();
}