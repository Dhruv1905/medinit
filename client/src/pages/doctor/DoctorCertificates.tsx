import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  getDoctorCertificates,
  processCertificate,
} from "../../services/certificateService";
import { useRealtime } from "../../hooks/useRealtime";

interface Patient {
  _id: string;
  name: string;
  email: string;
  instituteId: string;
}

interface Certificate {
  _id: string;
  patient: Patient;
  type: string;
  status: string;
  reason: string;
  startDate: string;
  endDate: string;
  verificationCode: string;
  createdAt: string;
  appointment?: {
    date: string;
    timeSlot: string;
    reason: string;
    diagnosis?: string;
  };
}

const typeLabels: Record<string, string> = {
  sick_leave: "Sick Leave",
  fitness: "Fitness",
  medical_report: "Medical Report",
  vaccination: "Vaccination",
  other: "Other",
};

const DoctorCertificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("requested");

  // Process dialog
  const [processDialog, setProcessDialog] = useState<Certificate | null>(null);
  const [processAction, setProcessAction] = useState<"approved" | "rejected">("approved");
  const [diagnosis, setDiagnosis] = useState("");
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await getDoctorCertificates(statusFilter || undefined);
      setCertificates(res.data.certificates);
    } catch {
      setError("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };
  useRealtime("certificate-update", fetchCertificates);

  useEffect(() => {
    fetchCertificates();
  }, [statusFilter]);

  const handleOpenProcess = (cert: Certificate, action: "approved" | "rejected") => {
    setProcessDialog(cert);
    setProcessAction(action);
    setDiagnosis("");
    setRemarks("");
    setRejectionReason("");
  };

  const handleProcess = async () => {
    if (!processDialog) return;
    setSaving(true);
    try {
      const data: any = { status: processAction };
      if (processAction === "approved") {
        if (diagnosis) data.diagnosis = diagnosis;
        if (remarks) data.remarks = remarks;
      } else {
        data.rejectionReason = rejectionReason || "Rejected";
      }

      await processCertificate(processDialog._id, data);
      setProcessDialog(null);
      fetchCertificates();
    } catch {
      setError("Failed to process certificate");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

  if (loading) {
    return <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>Certificates</Typography>
          <Typography variant="body1" color="text.secondary">Review and issue medical certificates</Typography>
        </Box>
        <TextField
          size="small"
          select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ width: 170 }}
        >
          <MenuItem value="requested">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
          <MenuItem value="">All</MenuItem>
        </TextField>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {certificates.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6" color="text.secondary">No certificates found</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {certificates.map((cert) => (
            <Card key={cert._id} sx={{ transition: "all 0.2s", "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.08)" } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ width: 44, height: 44, background: "linear-gradient(135deg, #3B82F6, #60A5FA)", fontWeight: 700 }}>
                      {cert.patient.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>{cert.patient.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cert.patient.instituteId} • {typeLabels[cert.type]} • {formatDate(cert.startDate)} to {formatDate(cert.endDate)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{cert.reason}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    {cert.status === "requested" ? (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleOpenProcess(cert, "approved")}
                          sx={{
                            borderRadius: 2,
                            background: "linear-gradient(135deg, #10B981, #34D399)",
                            "&:hover": { background: "linear-gradient(135deg, #059669, #10B981)" },
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleOpenProcess(cert, "rejected")}
                          sx={{ borderRadius: 2 }}
                        >
                          Reject
                        </Button>
                      </>
                    ) : (
                      <Chip
                        label={cert.status === "approved" ? "Approved" : "Rejected"}
                        color={cert.status === "approved" ? "success" : "error"}
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Process Dialog */}
      <Dialog open={!!processDialog} onClose={() => setProcessDialog(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {processAction === "approved" ? "Approve Certificate" : "Reject Certificate"}
        </DialogTitle>
        <DialogContent>
          {processDialog && (
            <Box sx={{ pt: 1 }}>
              <Box sx={{ p: 2, bgcolor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2, mb: 3 }}>
                <Typography variant="body2"><strong>Patient:</strong> {processDialog.patient.name} ({processDialog.patient.instituteId})</Typography>
                <Typography variant="body2"><strong>Type:</strong> {typeLabels[processDialog.type]}</Typography>
                <Typography variant="body2"><strong>Period:</strong> {formatDate(processDialog.startDate)} — {formatDate(processDialog.endDate)}</Typography>
                <Typography variant="body2"><strong>Reason:</strong> {processDialog.reason}</Typography>
              </Box>

              {processAction === "approved" ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>Diagnosis (optional)</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>Remarks (optional)</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Any additional notes for the certificate..."
                    />
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>Rejection Reason <span style={{ color: "#EF4444" }}>*</span></Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why the certificate is being rejected..."
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setProcessDialog(null)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button
            onClick={handleProcess}
            variant="contained"
            disabled={saving || (processAction === "rejected" && !rejectionReason)}
            sx={{
              borderRadius: 2,
              background: processAction === "approved"
                ? "linear-gradient(135deg, #10B981, #34D399)"
                : "linear-gradient(135deg, #EF4444, #F87171)",
              "&:hover": {
                background: processAction === "approved"
                  ? "linear-gradient(135deg, #059669, #10B981)"
                  : "linear-gradient(135deg, #C62828, #EF4444)",
              },
            }}
          >
            {saving ? <CircularProgress size={22} sx={{ color: "white" }} /> : processAction === "approved" ? "Approve & Issue" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorCertificates;