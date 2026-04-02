import api from "./api";

export const getAllMedicines = (params?: {
  search?: string;
  category?: string;
  lowStock?: string;
  expired?: string;
}) => api.get("/medicines", { params });

export const getInventoryStats = () => api.get("/medicines/stats");

export const getMedicineById = (id: string) => api.get(`/medicines/${id}`);

export const createMedicine = (data: any) => api.post("/medicines", data);

export const updateMedicine = (id: string, data: any) => api.put(`/medicines/${id}`, data);

export const updateStock = (id: string, quantity: number) =>
  api.patch(`/medicines/${id}/stock`, { quantity });

export const deleteMedicine = (id: string) => api.delete(`/medicines/${id}`);