import api from "./api.js";

export function fetchTickets(params) {
  return api.get("/tickets", { params }).then((r) => r.data);
}

export function fetchTicket(id) {
  return api.get(`/tickets/${id}`).then((r) => r.data);
}

/** @param {Record<string, string>} fields @param {File[]} files */
export function createTicket(fields, files = []) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") fd.append(k, String(v));
  });
  for (const f of files) {
    fd.append("attachments", f);
  }
  return api.post("/tickets", fd).then((r) => r.data);
}

export function updateTicket(id, body) {
  return api.put(`/tickets/${id}`, body).then((r) => r.data);
}

export function finalizeTicket(id, resolutionNote) {
  return api.post(`/tickets/${id}/finalize`, { resolutionNote }).then((r) => r.data);
}

export function assignTicket(id, assignedToId) {
  return api.put(`/tickets/${id}/assign`, { assignedToId }).then((r) => r.data);
}

export function fetchComments(ticketId) {
  return api.get(`/tickets/${ticketId}/comments`).then((r) => r.data);
}

export function addComment(ticketId, body) {
  return api.post(`/tickets/${ticketId}/comments`, body).then((r) => r.data);
}

export async function downloadTicketAttachment(ticketId, attachmentId, originalName) {
  const res = await api.get(`/tickets/${ticketId}/attachments/${attachmentId}/download`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = originalName || "anexo";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
