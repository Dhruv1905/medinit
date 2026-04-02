import api from "./api";

export const getDashboardReport = () => api.get("/reports/dashboard");