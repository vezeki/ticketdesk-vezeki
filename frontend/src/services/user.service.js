import api from "./api.js";

export function fetchUsers(params) {
  return api.get("/users", { params }).then((r) => r.data);
}

export function fetchTechnicians() {
  return api.get("/technicians").then((r) => r.data);
}

export function createUser(body) {
  return api.post("/users", body).then((r) => r.data);
}

export function updateUser(id, body) {
  return api.put(`/users/${id}`, body).then((r) => r.data);
}

export function deactivateUser(id) {
  return api.delete(`/users/${id}`).then((r) => r.data);
}
