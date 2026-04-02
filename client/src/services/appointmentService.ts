import api from "./api";

export const getDoctors = () => api.get("/appointments/doctors");

export const getAvailableSlots = (doctorId: string, date: string) =>
  api.get("/appointments/slots", { params: { doctorId, date } });

export const bookAppointment = (data: {
  doctor: string;
  date: string;
  timeSlot: string;
  reason: string;
  priority?: string;
}) => api.post("/appointments", data);

export const getMyAppointments = () => api.get("/appointments/my");

export const cancelAppointment = (id: string, reason?: string) =>
  api.patch(`/appointments/${id}/cancel`, { reason });

export const getDoctorAppointments = (date?: string) =>
  api.get("/appointments/doctor", { params: date ? { date } : {} });

export const getAllAppointments = (params?: { date?: string; status?: string }) =>
  api.get("/appointments/all", { params });

export const updateAppointmentStatus = (id: string, data: any) =>
  api.patch(`/appointments/${id}/status`, data);

export const updateVitals = (id: string, data: any) =>
  api.patch(`/appointments/${id}/vitals`, data);
export const getVisitHistory = () => api.get("/appointments/history");

export const getPrescriptions = (status?: string) =>
  api.get("/appointments/prescriptions", { params: status ? { status } : {} });

export const fulfillPrescription = (id: string, notes?: string) =>
  api.patch(`/appointments/${id}/fulfill`, { notes });