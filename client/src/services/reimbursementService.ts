import api from "./api";

export const createReimbursement = (formData: FormData) =>
    api.post("/reimbursements", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const getMyReimbursements = () => api.get("/reimbursements/my");

export const getAllReimbursements = () => api.get("/reimbursements/all");

export const updateReimbursementStatus = (id: string, status: string) =>
    api.patch(`/reimbursements/${id}/status`, { status });

export const processUPIPayment = (id: string) =>
    api.post(`/reimbursements/${id}/pay`);
