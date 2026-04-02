import api from "./api";

export const requestCertificate = (data: {
  doctor: string;
  type: string;
  reason: string;
  startDate: string;
  endDate: string;
  appointment?: string;
}) => api.post("/certificates/request", data);

export const getMyCertificates = () => api.get("/certificates/my");

export const getDoctorCertificates = (status?: string) =>
  api.get("/certificates/doctor", { params: status ? { status } : {} });

export const processCertificate = (id: string, data: any) =>
  api.patch(`/certificates/${id}/process`, data);

export const getAllCertificates = (params?: { status?: string; type?: string }) =>
  api.get("/certificates/all", { params });

export const verifyCertificate = (code: string) =>
  api.get(`/certificates/verify/${code}`);

export const revokeCertificate = (id: string) =>
  api.patch(`/certificates/${id}/revoke`);