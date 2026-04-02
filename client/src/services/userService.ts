import api from "./api";

export const createUser = (data: any) => api.post("/users", data);

export const getAllUsers = (params?: {
  role?: string;
  search?: string;
  status?: string;
}) => api.get("/users", { params });

export const getUserStats = () => api.get("/users/stats");

export const updateUserRole = (id: string, role: string) =>
  api.patch(`/users/${id}/role`, { role });

export const toggleUserStatus = (id: string) =>
  api.patch(`/users/${id}/toggle-status`);

export const deleteUser = (id: string) => api.delete(`/users/${id}`);