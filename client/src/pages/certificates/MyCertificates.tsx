import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import VerifiedIcon from "@mui/icons-material/Verified";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EventIcon from "@mui/icons-material/Event";
import {
  getMyCertificates,
  requestCertificate,
  getAllCertificates,
} from "../../services/certificateService";
import { getDoctors } from "../../services/appointmentService";
import { useAuth } from "../../context/Authcontext";
import DownloadIcon from "@mui/icons-material/Download";
import api from "../../services/api";
interface Certificate {
  _id: string;
  doctor: { _id: string; name: string };
  patient?: { _id: string; name: string };
  type: string;
  status: string;
  reason: string;
  diagnosis?: string;
  startDate: string;
  endDate: string;
  remarks?: string;
  rejectionReason?: string;
  verificationCode: string;
  issuedAt?: string;
  createdAt: string;
}

interface Doctor {
  _id: string;
  name: string;
}

const typeLabels: Record<string, string> = {
  sick_leave: "Sick Leave",
  fitness: "Fitness Certificate",
  medical_report: "Medical Report",
  vaccination: "Vaccination Certificate",
  other: "Other",
};

const statusConfig: Record<string, { color: "primary" | "success" | "error" | "warning" | "default"; label: string }> = {
  requested: { color: "primary", label: "Pending" },
  approved: { color: "success", label: "Approved" },
  rejected: { color: "error", label: "Rejected" },
  revoked: { color: "default", label: "Revoked" },
};

const MyCertificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Request dialog
  const [requestOpen, setRequestOpen] = useState(false);
  const [form, setForm] = useState({
    doctor: "",
    type: "sick_leave",
    reason: "",
    startDate: "",
    endDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Detail dialog
  const [detailDialog, setDetailDialog] = useState<Certificate | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    try {
      const [certRes, docRes] = await Promise.all([
        user?.role === "admin" ? getAllCertificates() : getMyCertificates(),
        getDoctors(),
      ]);
      setCertificates(certRes.data.certificates);
      setDoctors(docRes.data.doctors);
    } catch {
      setError("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequest = async () => {
    setFormError("");
    setSaving(true);
    try {
      await requestCertificate(form);
      setRequestOpen(false);
      setForm({ doctor: "", type: "sick_leave", reason: "", startDate: "", endDate: "" });
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to submit request");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async (certId: string, code: string) => {
    try {
      const response = await api.get(`/certificates/${certId}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificate-${code}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download certificate");
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Medical Certificates
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Request and manage medical certificates
          </Typography>
        </Box>
        {user?.role !== "admin" && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setRequestOpen(true)}
            sx={{
              background: "linear-gradient(135deg, #3B82F6, #60A5FA)",
              "&:hover": { background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" },
            }}
          >
            Request Certificate
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {certificates.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <DescriptionIcon sx={{ fontSize: 60, color: "text.secondary", opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No certificates yet</Typography>
            <Typography variant="body2" color="text.secondary">Request your first medical certificate</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {certificates.map((cert) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cert._id}>
              <Card
                sx={{
                  transition: "all 0.2s",
                  cursor: "pointer",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 28px rgba(0,0,0,0.08)" },
                  borderTop: `4px solid ${cert.status === "approved" ? "#10B981"
                    : cert.status === "rejected" ? "#EF4444"
                      : cert.status === "revoked" ? "#9E9E9E"
                        : "#3B82F6"
                    }`,
                }}
                onClick={() => setDetailDialog(cert)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Chip
                      label={typeLabels[cert.type] || cert.type}
                      size="small"
                      sx={{ bgcolor: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", color: "primary.main", fontWeight: 600, fontSize: "0.7rem" }}
                    />
                    <Chip
                      label={statusConfig[cert.status]?.label || cert.status}
                      size="small"
                      color={statusConfig[cert.status]?.color || "default"}
                      sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                    />
                  </Box>

                  <Typography variant="subtitle1" fontWeight={700} mb={user?.role === "admin" && cert.patient ? 0 : 0.5}>
                    Dr. {cert.doctor?.name || "Unknown"}
                  </Typography>

                  {user?.role === "admin" && cert.patient && (
                    <Typography variant="body2" color="primary.main" mb={0.5} fontWeight={600}>
                      Patient: {cert.patient?.name}
                    </Typography>
                  )}

                  <Typography variant="body2" color="text.secondary" mb={1.5} sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}>
                    {cert.reason}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EventIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(cert.startDate)} — {formatDate(cert.endDate)}
                    </Typography>
                  </Box>

                  {cert.status === "approved" && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: "#E8F5E9", borderRadius: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <VerifiedIcon sx={{ fontSize: 16, color: "success.main" }} />
                        <Typography variant="caption" fontWeight={600} color="success.dark" sx={{ flex: 1 }}>
                          {cert.verificationCode}
                        </Typography>
                        <ContentCopyIcon
                          sx={{ fontSize: 14, color: "success.main", cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCode(cert.verificationCode);
                          }}
                        />
                      </Box>
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(cert._id, cert.verificationCode);
                        }}
                        sx={{ mt: 1, fontSize: "0.7rem" }}
                      >
                        Download PDF
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Request Dialog */}
      <Dialog open={requestOpen} onClose={() => setRequestOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Request Medical Certificate</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{formError}</Alert>}
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Select Doctor"
              select
              fullWidth
              value={form.doctor}
              onChange={(e) => setForm({ ...form, doctor: e.target.value })}
            >
              {doctors.map((d) => (
                <MenuItem key={d._id} value={d._id}>Dr. {d.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Certificate Type"
              select
              fullWidth
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {Object.entries(typeLabels).map(([val, label]) => (
                <MenuItem key={val} value={val}>{label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Reason"
              fullWidth
              multiline
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Describe why you need this certificate..."
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setRequestOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button
            onClick={handleRequest}
            variant="contained"
            disabled={saving || !form.doctor || !form.reason || !form.startDate || !form.endDate}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #3B82F6, #60A5FA)",
              "&:hover": { background: "linear-gradient(135deg, #1D4ED8, #3B82F6)" },
            }}
          >
            {saving ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Submit Request"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onClose={() => setDetailDialog(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Certificate Details</DialogTitle>
        <DialogContent>
          {detailDialog && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Typography variant="body1" fontWeight={600}>{typeLabels[detailDialog.type]}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box>
                    <Chip
                      label={statusConfig[detailDialog.status]?.label}
                      size="small"
                      color={statusConfig[detailDialog.status]?.color}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Doctor</Typography>
                  <Typography variant="body2" fontWeight={600}>Dr. {detailDialog.doctor?.name || "Unknown"}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Period</Typography>
                  <Typography variant="body2">{formatDate(detailDialog.startDate)} — {formatDate(detailDialog.endDate)}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="caption" color="text.secondary">Reason</Typography>
              <Typography variant="body2" mb={2}>{detailDialog.reason}</Typography>

              {detailDialog.diagnosis && (
                <>
                  <Typography variant="caption" color="text.secondary">Diagnosis</Typography>
                  <Typography variant="body2" mb={2}>{detailDialog.diagnosis}</Typography>
                </>
              )}

              {detailDialog.remarks && (
                <>
                  <Typography variant="caption" color="text.secondary">Doctor's Remarks</Typography>
                  <Typography variant="body2" mb={2}>{detailDialog.remarks}</Typography>
                </>
              )}

              {detailDialog.rejectionReason && (
                <>
                  <Typography variant="caption" color="text.secondary">Rejection Reason</Typography>
                  <Typography variant="body2" color="error.main" mb={2}>{detailDialog.rejectionReason}</Typography>
                </>
              )}

              {detailDialog.status === "approved" && (
                <Box sx={{ mt: 1, p: 2, bgcolor: "#E8F5E9", borderRadius: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <VerifiedIcon sx={{ color: "success.main" }} />
                    <Typography variant="subtitle2" fontWeight={700} color="success.dark">
                      Verified Certificate
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    Code: {detailDialog.verificationCode}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Issued: {detailDialog.issuedAt ? formatDate(detailDialog.issuedAt) : "—"}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => handleCopyCode(detailDialog.verificationCode)}
                    sx={{ mt: 1, display: "block" }}
                  >
                    {copied ? "Copied!" : "Copy Verification Code"}
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(detailDialog._id, detailDialog.verificationCode)}
                      sx={{
                        mt: 1,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #10B981, #34D399)",
                        "&:hover": { background: "linear-gradient(135deg, #059669, #10B981)" },
                      }}
                    >
                      Download PDF
                    </Button>
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDetailDialog(null)} variant="outlined" sx={{ borderRadius: 2 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyCertificates;