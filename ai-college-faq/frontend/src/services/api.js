const API_BASE = "http://localhost:8000/api";

export async function askQuestion(question) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Server communication failed.");
  }
  return res.json();
}

export async function fetchDocuments() {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error("Could not retrieve documents list.");
  return res.json();
}

export async function uploadDocument(file, adminPassword) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: "POST",
    headers: { "x-admin-password": adminPassword },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "File upload failed.");
  }
  return res.json();
}

export async function deleteDocument(docId, adminPassword) {
  const res = await fetch(`${API_BASE}/documents/${docId}`, {
    method: "DELETE",
    headers: { "x-admin-password": adminPassword },
  });
  if (!res.ok) throw new Error("Deletion failed.");
  return res.json();
}

export async function reindexKB(adminPassword) {
  const res = await fetch(`${API_BASE}/documents/reindex`, {
    method: "POST",
    headers: { "x-admin-password": adminPassword },
  });
  if (!res.ok) throw new Error("Reindexing failed.");
  return res.json();
}