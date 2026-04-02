import api from "./api";

export const reportEmergency = (data: {
  severity: string;
  description: string;
  location: string;
}) => api.post("/emergencies/report", data);

export const getMyEmergencies = () => api.get("/emergencies/my");

export const getActiveEmergencies = () => api.get("/emergencies/active");

export const getAllEmergencies = () => api.get("/emergencies/all");

export const updateEmergency = (id: string, data: any) =>
  api.patch(`/emergencies/${id}`, data);